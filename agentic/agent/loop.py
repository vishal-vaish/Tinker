"""
agent.loop — Core Autonomous Agent Loop

WHAT THIS FILE DOES:
- Drives the Observe → Diagnose → Decide → Act → Reflect execution cycle.
- Pre-takes a clean project snapshot for backup and diffing.
- Runs baseline tests prior to modifications to capture initial failures.
- Assembles prompt context within budget using ContextManager and PlanManager.
- Calls OllamaClient, routes tool calls through the PermissionGate, and executes tools.
- Detects no-progress loops (identical tool calls or stagnant file state).
- Switches to fallback model on repeated failures.
- Executes independent verification (clean test re-run) before declaring success.
- Generates unified diffs and records final reports and traces.
"""
import os
import sys
import time
import uuid
import json
import shutil
import difflib
from datetime import datetime
from collections import Counter

from agent.config import AgentConfig
from agent.models import OllamaClient, ModelResponse, ToolCall
from agent.events import (
    EventEmitter, RUN_STARTED, STEP_PROGRESS, TOOL_CALL,
    TOOL_RESULT, RUN_FINISHED, SPEECH_SUMMARY, APPROVAL_REQUEST,
)
from agent.tools.registry import ToolRegistry
from agent.tools.read_tools import register_read_tools
from agent.tools.write_tools import register_write_tools
from agent.tools.exec_tools import register_exec_tools, _run_tests
from agent.safety.jail import PathJail, SecurityError
from agent.safety.allowlist import CommandAllowlist
from agent.safety.permissions import PermissionGate
from agent.context import ContextManager
from agent.plan import PlanManager
from agent.tracing import RunTracer
from agent.report import build_report, format_report_text, build_markdown_report
from agent.stacks import validate_and_resolve_stack, ResolvedProjectStack, StackValidationError


SYSTEM_PROMPT = """You are an expert coding agent. Your goal is to solve a coding task by exploring code, editing files, running tests, fixing bugs, and verifying your work.

AVAILABLE TOOLS:
- list_files(path="."): List files and folders in a directory
- read_file(path, start_line=1, end_line=0): Read file content with line ranges
- search_text(pattern, path="."): Search for text/regex across project files
- edit_file(path, old_string, new_string): Replace a UNIQUE string in a file. Must be unique. Include enough context lines to make it unique.
- create_file(path, content): Create a new file (fails if it exists)
- run_command(command): Run an allowlisted shell command
- run_tests(command=""): Run tests and see only failing tests and error messages
- finish(summary): Declare completion when all tests pass

WORKFLOW:
1. EXPLORE: Run tests first (`run_tests`) to see what fails. Read the relevant source files.
2. PLAN: Form a clear hypothesis about what's broken and how to fix it.
3. ACT: Use `edit_file` to fix the bug. Provide exact, unique old_string with surrounding lines.
4. VERIFY: Run `run_tests` to check if your fix worked.
5. RETRY: If tests still fail, read the error carefully, diagnose, and try a different approach.
6. FINISH: Only call `finish` when `run_tests` reports TESTS PASSED.

RULES:
- Always run tests before claiming success. Never guess.
- Do NOT edit test files unless explicitly told to. Test files are read-only.
- When using `edit_file`, make sure `old_string` appears EXACTLY ONCE in the file.
- Be concise. Focus on fixing the bug.
- Respond with tool calls to take action.
"""


class AgentLoop:
    """The main agent loop that processes coding tasks end-to-end."""

    def __init__(
        self,
        config: AgentConfig,
        model: OllamaClient,
        emitter: EventEmitter,
    ):
        self.config = config
        self.model = model
        self.emitter = emitter
        self._cancelled = False

    def cancel(self):
        """Cancel the current run."""
        self._cancelled = True
        self.model.cancel()

    def run(
        self,
        task: str,
        project_root: str,
        requested_stack: str = "auto",
        run_dir: str = None,
        is_draft: bool = False,
    ) -> dict:
        """
        Run the agent on a coding task.

        Args:
            task: What the agent should do
            project_root: Absolute path to the project directory
            requested_stack: 'auto', or stack name(s) e.g. 'react', 'nextjs', 'python,vite'
            run_dir: Optional explicit path to run directory (overrides sandboxes routing)
            is_draft: Flag indicating whether this target is an ephemeral draft

        Returns:
            Run summary dict
        """
        self._cancelled = False
        project_root = os.path.realpath(os.path.abspath(project_root))

        # ── Step 0: Validate and Resolve Framework Stack at Project Start ─────
        is_valid, stack_msg, resolved_stack = validate_and_resolve_stack(
            project_root, requested_stack, task=task, default_stack=self.config.default_stack
        )
        if not is_valid:
            raise StackValidationError(stack_msg)

        run_id = datetime.now().strftime('%Y%m%d_%H%M%S') + '_' + uuid.uuid4().hex[:6]

        # Base directory for sandboxes and scoped runs
        agentic_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        repo_root = os.path.dirname(agentic_root)
        sandboxes_root = os.path.join(repo_root, 'sandboxes')

        if run_dir:
            scoped_run_dir = run_dir
        else:
            norm_project = os.path.normpath(project_root)
            norm_sandboxes = os.path.normpath(sandboxes_root)
            projects_dir = os.path.join(norm_sandboxes, 'projects')
            drafts_dir = os.path.join(norm_sandboxes, 'drafts')
            eval_dir = os.path.join(agentic_root, 'eval', 'tasks')

            try:
                rel_proj = os.path.relpath(norm_project, projects_dir)
            except ValueError:
                rel_proj = '..'

            try:
                rel_draft = os.path.relpath(norm_project, drafts_dir)
            except ValueError:
                rel_draft = '..'

            try:
                rel_eval = os.path.relpath(norm_project, eval_dir)
            except ValueError:
                rel_eval = '..'

            if not rel_proj.startswith('..') and rel_proj != '.':
                proj_id = rel_proj.split(os.sep)[0]
                scoped_run_dir = os.path.join(sandboxes_root, 'runs', 'projects', proj_id, run_id)
            elif not rel_draft.startswith('..') and rel_draft != '.':
                draft_id = rel_draft.split(os.sep)[0]
                scoped_run_dir = os.path.join(sandboxes_root, 'runs', 'drafts', draft_id, run_id)
            elif not rel_eval.startswith('..') and rel_eval != '.':
                task_id = rel_eval.split(os.sep)[0]
                scoped_run_dir = os.path.join(sandboxes_root, 'runs', 'eval', task_id, run_id)
            elif is_draft:
                draft_name = os.path.basename(norm_project) or 'draft'
                scoped_run_dir = os.path.join(sandboxes_root, 'runs', 'drafts', draft_name, run_id)
            else:
                proj_name = os.path.basename(norm_project) or 'project'
                scoped_run_dir = os.path.join(sandboxes_root, 'runs', 'projects', proj_name, run_id)

        # Setup tracing
        tracer = RunTracer(run_id, run_dir=scoped_run_dir)
        self.emitter.set_run_id(run_id)
        self.emitter.subscribe(None, tracer.record_event)

        # Setup safety systems with dynamic stack permissions
        jail = PathJail(project_root, test_patterns=resolved_stack.test_patterns)
        allowlist = CommandAllowlist(self.config.allowed_commands)
        allowlist.add_allowed(resolved_stack.allowed_commands)

        gate = PermissionGate(
            jail=jail,
            allowlist=allowlist,
            emitter=self.emitter,
            approval_timeout=self.config.approval_timeout,
        )

        # Setup tools with stack-specific verification command
        tools = ToolRegistry()
        register_read_tools(tools, project_root)
        register_write_tools(tools, project_root)
        register_exec_tools(
            tools, project_root,
            command_timeout=self.config.command_timeout,
            output_cap=self.config.output_cap_bytes,
            test_command=resolved_stack.default_verify_command,
        )

        # Setup context manager
        main_model_config = self.config.get_model_config('main')
        context_mgr = ContextManager(
            context_limit=main_model_config.context_limit,
            keep_recent=4,
        )

        # Setup scratchpad plan
        plan_mgr = PlanManager(tracer.plan_path)
        plan_mgr.write(f"# Plan for: {task}\n\n1. Run tests/build to see current state\n2. Locate the issue\n3. Apply fix\n4. Verify tests/build pass\n")

        # Emit run started with stack information
        self.emitter.emit(RUN_STARTED, {
            'task': task,
            'project_root': project_root,
            'is_draft': is_draft,
            'run_dir': tracer.run_dir,
            'stack': resolved_stack.summary(),
            'config': {
                'max_steps': self.config.max_steps,
                'max_time_seconds': self.config.max_time_seconds,
                'model_main': main_model_config.model,
                'model_fallback': self.config.get_model_config('fallback').model,
            },
        })

        # --- Baseline: Run tests/build before any changes ---
        initial_test_result = _run_tests(command=resolved_stack.default_verify_command, project_root=project_root)
        with open(os.path.join(tracer.run_dir, 'artifacts', 'tests_before.txt'), 'w', encoding='utf-8') as f:
            f.write(initial_test_result)

        # --- Snapshot project before any edits ---
        snapshot_dir = os.path.join(tracer.run_dir, 'snapshot')
        self._take_snapshot(project_root, snapshot_dir)

        # Prepare system prompt with framework guidance
        active_system_prompt = SYSTEM_PROMPT
        if resolved_stack.prompt_guidance:
            active_system_prompt += f"\n\nFRAMEWORK & STACK GUIDANCE:\n{resolved_stack.prompt_guidance}"

        # State tracking
        full_message_history: list[dict] = [
            {'role': 'system', 'content': active_system_prompt},
            {'role': 'user', 'content': (
                f"Task: {task}\n\n"
                f"Project directory: {project_root}\n\n"
                f"Initial test run:\n{initial_test_result}\n\n"
                f"Start by investigating the failure and forming a plan."
            )},
        ]

        steps: list[dict] = []
        tool_counts: Counter = Counter()
        start_time = time.time()
        current_role = 'main'
        consecutive_invalid = 0
        last_tool_calls: list[tuple[str, str]] = []
        last_failure_key: str = ''
        same_failure_retries: int = 0
        consecutive_no_file_changes: int = 0
        stop_reason = 'unknown'
        status = 'failed'

        try:
            for step_num in range(1, self.config.max_steps + 1):
                elapsed = time.time() - start_time

                # ── Stop condition checks ────────────────────────────────
                if self._cancelled:
                    stop_reason = 'cancelled'
                    break

                if elapsed >= self.config.max_time_seconds:
                    stop_reason = f'time_budget ({self.config.max_time_seconds}s)'
                    break

                # No-progress: same tool call repeated N times
                if len(last_tool_calls) >= self.config.no_progress_threshold:
                    recent = last_tool_calls[-self.config.no_progress_threshold:]
                    if len(set(recent)) == 1:
                        stop_reason = f'no_progress (same call repeated {self.config.no_progress_threshold} times)'
                        break

                # No-progress: N consecutive steps with no file changes and no new info
                if consecutive_no_file_changes >= self.config.no_progress_threshold * 2:
                    stop_reason = f'no_progress ({consecutive_no_file_changes} steps without progress)'
                    break

                # ── Build context-managed messages ────────────────────────
                current_plan = plan_mgr.read()
                messages, context_info = context_mgr.build_messages(
                    system_prompt=SYSTEM_PROMPT,
                    task=task,
                    plan=current_plan,
                    full_message_history=full_message_history,
                )

                # Emit progress
                self.emitter.emit(STEP_PROGRESS, {
                    'step': step_num,
                    'description': f'Step {step_num}/{self.config.max_steps} — thinking...',
                    'elapsed': round(elapsed, 1),
                    'tokens_used': context_info.get('total_tokens', 0),
                    'role': current_role,
                }, step=step_num)

                # ── Call model ───────────────────────────────────────────
                try:
                    response = self.model.send(
                        messages=messages,
                        tools=tools.get_schemas(),
                        role=current_role,
                    )
                except ConnectionError as e:
                    stop_reason = f'model_error: {e}'
                    break
                except TimeoutError as e:
                    stop_reason = f'model_timeout: {e}'
                    break
                except InterruptedError:
                    stop_reason = 'cancelled'
                    break

                step_record = {
                    'step': step_num,
                    'tokens_in': response.tokens_in,
                    'tokens_out': response.tokens_out,
                    'duration_ms': response.duration_ms,
                    'mode': response.mode,
                    'role': current_role,
                    'context_tokens': context_info.get('total_tokens', 0),
                }

                # ── Process response ─────────────────────────────────────
                if response.tool_calls:
                    consecutive_invalid = 0
                    tc = response.tool_calls[0]

                    # Check permission gate
                    tool_def = tools.get(tc.name)
                    tool_risk = tool_def.risk if tool_def else 'execute'
                    
                    permitted, deny_reason = gate.check_tool(tc.name, tool_risk, tc.arguments)
                    if not permitted:
                        # Return denial to model
                        result_text = f"PERMISSION DENIED: {deny_reason}"
                        full_message_history.append({
                            'role': 'assistant',
                            'content': response.text or '',
                            'tool_calls': [{'function': {'name': tc.name, 'arguments': tc.arguments}}],
                        })
                        full_message_history.append({
                            'role': 'tool',
                            'content': result_text,
                        })
                        step_record['tool'] = tc.name
                        step_record['tool_args'] = tc.arguments
                        step_record['tool_result'] = result_text
                        steps.append(step_record)
                        context_mgr.add_step(step_record)
                        continue

                    # Handle finish tool
                    if tc.name == 'finish':
                        tool_counts['finish'] += 1
                        summary_text = tc.arguments.get('summary', 'Done.')

                        # Final verification: re-run tests from clean state
                        if self.config.final_verification:
                            final_test = _run_tests(command=resolved_stack.default_verify_command, project_root=project_root)
                            if 'TESTS PASSED' in final_test:
                                if gate.has_modified_tests:
                                    status = 'failed'
                                    stop_reason = 'test_files_modified (invalid run)'
                                else:
                                    status = 'success'
                                    stop_reason = 'verified_success'
                            else:
                                status = 'failed'
                                stop_reason = 'finish_called_but_tests_still_fail'
                        else:
                            status = 'success'
                            stop_reason = 'finish_called'

                        self.emitter.emit(TOOL_CALL, {'tool': tc.name, 'arguments': tc.arguments}, step=step_num)
                        self.emitter.emit(TOOL_RESULT, {'tool': tc.name, 'result': summary_text}, step=step_num)
                        self.emitter.emit(SPEECH_SUMMARY, {'text': summary_text}, step=step_num)

                        step_record['tool'] = tc.name
                        step_record['tool_args'] = tc.arguments
                        step_record['tool_result'] = summary_text
                        steps.append(step_record)
                        break

                    # Execute regular tool
                    self.emitter.emit(TOOL_CALL, {'tool': tc.name, 'arguments': tc.arguments}, step=step_num)
                    result = tools.execute(tc.name, tc.arguments)
                    tool_counts[tc.name] += 1

                    # Track file changes for no-progress
                    if tc.name in ('edit_file', 'create_file') and result['success']:
                        consecutive_no_file_changes = 0
                        gate.record_file_modified(tc.arguments.get('path', ''))
                        plan_mgr.update_step(step_num, f"Edited {tc.arguments.get('path')}")
                    else:
                        consecutive_no_file_changes += 1

                    result_text = result.get('result', '') if result['success'] else f"ERROR: {result.get('error', '')}"

                    self.emitter.emit(TOOL_RESULT, {
                        'tool': tc.name,
                        'success': result['success'],
                        'result': str(result_text)[:300],
                    }, step=step_num)

                    # Track for no-progress
                    args_hash = json.dumps(tc.arguments, sort_keys=True)
                    last_tool_calls.append((tc.name, args_hash))

                    # Track test failures for retry limit
                    if tc.name == 'run_tests':
                        if 'TESTS FAILED' in str(result_text):
                            failure_key = str(result_text)[:200]
                            if failure_key == last_failure_key:
                                same_failure_retries += 1
                                if same_failure_retries >= self.config.max_retries_same_failure:
                                    if current_role == 'main':
                                        current_role = 'fallback'
                                        same_failure_retries = 0
                                        self.emitter.emit(STEP_PROGRESS, {
                                            'step': step_num,
                                            'description': f'Same failure {self.config.max_retries_same_failure} times — switching to fallback model',
                                        }, step=step_num)
                                    else:
                                        stop_reason = f'retry_limit_reached ({self.config.max_retries_same_failure} retries on both models)'
                                        break
                            else:
                                last_failure_key = failure_key
                                same_failure_retries = 0
                        elif 'TESTS PASSED' in str(result_text):
                            # Tests pass! Hint the model to finish
                            result_text += "\n\nAll tests pass! Call the finish tool now to complete the task."

                    # Add to message history
                    full_message_history.append({
                        'role': 'assistant',
                        'content': response.text or '',
                        'tool_calls': [{'function': {'name': tc.name, 'arguments': tc.arguments}}],
                    })
                    full_message_history.append({
                        'role': 'tool',
                        'content': str(result_text),
                    })

                    step_record['tool'] = tc.name
                    step_record['tool_args'] = tc.arguments
                    step_record['tool_result'] = str(result_text)[:500]

                elif response.text:
                    # Model gave text without tool call
                    consecutive_invalid += 1
                    consecutive_no_file_changes += 1

                    if consecutive_invalid >= self.config.max_consecutive_invalid_calls:
                        if current_role == 'main':
                            current_role = 'fallback'
                            consecutive_invalid = 0
                            self.emitter.emit(STEP_PROGRESS, {
                                'step': step_num,
                                'description': f'Switching to fallback model after {self.config.max_consecutive_invalid_calls} invalid calls',
                            }, step=step_num)
                        else:
                            stop_reason = 'consecutive_invalid_calls'
                            break

                    full_message_history.append({'role': 'assistant', 'content': response.text})
                    full_message_history.append({
                        'role': 'user',
                        'content': 'Please call a tool to take action. Available tools: list_files, read_file, search_text, edit_file, create_file, run_command, run_tests, finish.',
                    })
                    step_record['text'] = response.text[:300]

                else:
                    consecutive_invalid += 1
                    consecutive_no_file_changes += 1
                    if consecutive_invalid >= self.config.max_consecutive_invalid_calls:
                        stop_reason = 'consecutive_empty_responses'
                        break
                    full_message_history.append({
                        'role': 'user',
                        'content': 'Received empty response. Please call a tool to proceed.',
                    })

                steps.append(step_record)
                context_mgr.add_step(step_record)

            else:
                stop_reason = f'step_budget ({self.config.max_steps})'

        except KeyboardInterrupt:
            stop_reason = 'user_cancel (Ctrl+C)'
        except Exception as e:
            stop_reason = f'error: {type(e).__name__}: {e}'

        end_time = time.time()

        # --- Final test run after all changes ---
        final_test_result = _run_tests(command=resolved_stack.default_verify_command, project_root=project_root)
        with open(os.path.join(tracer.run_dir, 'artifacts', 'tests_after.txt'), 'w', encoding='utf-8') as f:
            f.write(final_test_result)

        # Generate diff of changes
        diff_text = self._generate_diff(snapshot_dir, project_root)
        with open(os.path.join(tracer.run_dir, 'artifacts', 'changes.diff'), 'w', encoding='utf-8') as f:
            f.write(diff_text)

        # If tests pass now and were failing before, that's a success
        if 'TESTS PASSED' in final_test_result and not gate.has_modified_tests:
            status = 'success'
            if stop_reason.startswith('step_budget') or stop_reason == 'finish_called':
                stop_reason = 'verified_success'

        # Build and save report
        model_config = self.config.get_model_config(current_role)
        summary = build_report(
            task=task,
            project_root=project_root,
            run_id=run_id,
            steps=steps,
            stop_reason=stop_reason,
            start_time=start_time,
            end_time=end_time,
            tool_counts=dict(tool_counts),
            model_info={'role': current_role, 'name': model_config.model},
            status=status,
        )
        summary['tests_before'] = initial_test_result.split('\n')[0]
        summary['tests_after'] = final_test_result.split('\n')[0]
        summary['files_modified'] = gate.files_modified
        summary['tests_modified'] = gate.has_modified_tests
        summary['run_dir'] = tracer.run_dir

        tracer.write_summary(summary)

        # Build and save human-readable REPORT.md and master RUNS.md catalog
        diff_path = os.path.join(tracer.run_dir, 'artifacts', 'changes.diff')
        diff_text = ""
        if os.path.isfile(diff_path):
            try:
                with open(diff_path, 'r', encoding='utf-8', errors='replace') as f:
                    diff_text = f.read()
            except Exception:
                diff_text = ""

        report_md = build_markdown_report(summary, steps, diff_text=diff_text)
        tracer.write_markdown_report(report_md)
        tracer.update_history_catalog(summary)

        # Emit finished
        self.emitter.emit(RUN_FINISHED, {
            'status': status,
            'stop_reason': stop_reason,
            'steps': len(steps),
            'run_dir': tracer.run_dir,
            'tests_pass': 'TESTS PASSED' in final_test_result,
        })

        return summary

    def _take_snapshot(self, src: str, dst: str):
        """Create a full copy snapshot of the project directory."""
        if os.path.exists(dst):
            shutil.rmtree(dst)
        shutil.copytree(
            src, dst,
            ignore=shutil.ignore_patterns('__pycache__', '*.pyc', '.git', 'node_modules', '.next', 'dist', '.cache'),
        )

    def _generate_diff(self, original_dir: str, current_dir: str) -> str:
        """Generate a unified diff between the snapshot and current state."""
        diffs = []
        ignored_dirs = {'__pycache__', '.git', 'node_modules', '.next', 'dist', '.cache'}
        for root, dirs, files in os.walk(current_dir):
            dirs[:] = [d for d in dirs if d not in ignored_dirs]
            if any(ignored in root for ignored in ignored_dirs):
                continue
            for fname in files:
                cur_file = os.path.join(root, fname)
                rel = os.path.relpath(cur_file, current_dir)
                orig_file = os.path.join(original_dir, rel)

                if not os.path.isfile(orig_file):
                    diffs.append(f"--- /dev/null\n+++ {rel} (new file)")
                    continue

                try:
                    with open(orig_file, 'r', encoding='utf-8', errors='replace') as f:
                        orig_lines = f.readlines()
                    with open(cur_file, 'r', encoding='utf-8', errors='replace') as f:
                        cur_lines = f.readlines()
                    
                    file_diff = list(difflib.unified_diff(
                        orig_lines, cur_lines,
                        fromfile=f'a/{rel}', tofile=f'b/{rel}',
                    ))
                    if file_diff:
                        diffs.extend(file_diff)
                except Exception:
                    continue

        return ''.join(diffs) if diffs else '(No files modified)'
