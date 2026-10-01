"""
eval.test_core_modules — Unit Test Suite for All Core Non-LLM Modules

WHAT THIS FILE DOES:
- Provides 17 fast, deterministic unit tests that run completely offline without requiring Ollama.
- Tests config loading, path jail enforcement, command allowlist rules, and risk permissions.
- Tests tool execution (read_file, edit_file uniqueness, create_file overwrite prevention).
- Tests context token estimation, window truncation, and step summarization.
- Tests scratchpad plan management, run trace initialization, and report formatting.
"""
import unittest
import os
import sys
import tempfile
import shutil
import time

# Add parent to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agent.config import AgentConfig
from agent.events import EventEmitter, Event, RUN_STARTED, TOOL_CALL
from agent.safety.jail import PathJail, SecurityError
from agent.safety.allowlist import CommandAllowlist
from agent.safety.permissions import PermissionGate
from agent.tools.registry import ToolRegistry, ToolDef
from agent.tools.read_tools import register_read_tools
from agent.tools.write_tools import register_write_tools
from agent.tools.exec_tools import register_exec_tools
from agent.context import ContextManager, estimate_tokens, summarize_step
from agent.plan import PlanManager
from agent.tracing import RunTracer
from agent.report import build_report, format_report_text


class TestConfig(unittest.TestCase):
    def test_load_config(self):
        config_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'config.toml')
        cfg = AgentConfig(config_path)
        self.assertEqual(cfg.get_model_config('main').model, 'gemma4:latest')
        self.assertEqual(cfg.get_model_config('fallback').model, 'qwen3.5:9b')
        self.assertEqual(cfg.max_steps, 30)
        self.assertEqual(cfg.max_time_seconds, 600)
        self.assertIn('python -m unittest', cfg.allowed_commands)


class TestSafety(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.mkdtemp()
        self.jail = PathJail(self.temp_dir)
        self.allowlist = CommandAllowlist(['python -m unittest', 'git status'])
        self.emitter = EventEmitter()
        self.gate = PermissionGate(self.jail, self.allowlist, self.emitter)

    def tearDown(self):
        shutil.rmtree(self.temp_dir)

    def test_jail_inside_path(self):
        safe = self.jail.check('subdir/file.py')
        self.assertTrue(safe.startswith(self.jail.project_root))

    def test_jail_escape_attempt(self):
        with self.assertRaises(SecurityError):
            self.jail.check('../outside.py')

    def test_jail_absolute_outside(self):
        with self.assertRaises(SecurityError):
            self.jail.check('C:\\Windows\\System32\\calc.exe' if os.name == 'nt' else '/etc/passwd')

    def test_allowlist_allowed(self):
        allowed, _ = self.allowlist.is_allowed('python -m unittest discover')
        self.assertTrue(allowed)

    def test_allowlist_denied(self):
        allowed, _ = self.allowlist.is_allowed('rm -rf /')
        self.assertFalse(allowed)

    def test_allowlist_shell_chaining_denied(self):
        allowed, _ = self.allowlist.is_allowed('python -m unittest && rm -rf /')
        self.assertFalse(allowed)

    def test_test_file_protection(self):
        self.assertTrue(self.jail.is_test_file('test_math.py'))
        self.assertTrue(self.jail.is_test_file('math_test.py'))
        self.assertFalse(self.jail.is_test_file('math_utils.py'))


class TestTools(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.mkdtemp()
        self.registry = ToolRegistry()
        register_read_tools(self.registry, self.temp_dir)
        register_write_tools(self.registry, self.temp_dir)
        register_exec_tools(self.registry, self.temp_dir)

    def tearDown(self):
        shutil.rmtree(self.temp_dir)

    def test_tool_schemas(self):
        schemas = self.registry.get_schemas()
        names = [s['function']['name'] for s in schemas]
        expected = ['list_files', 'read_file', 'search_text', 'finish',
                    'edit_file', 'create_file', 'run_command', 'run_tests']
        for exp in expected:
            self.assertIn(exp, names)

    def test_create_and_read_file(self):
        # Create
        res = self.registry.execute('create_file', {'path': 'test.txt', 'content': 'Hello\nWorld\n'})
        self.assertTrue(res['success'])

        # Read
        res = self.registry.execute('read_file', {'path': 'test.txt'})
        self.assertTrue(res['success'])
        self.assertIn('Hello', res['result'])

    def test_edit_file_unique_string(self):
        # Create file with unique content
        self.registry.execute('create_file', {'path': 'calc.py', 'content': 'def add(a, b):\n    return a + b\n'})

        # Edit
        res = self.registry.execute('edit_file', {
            'path': 'calc.py',
            'old_string': 'return a + b',
            'new_string': 'return a + b  # fixed',
        })
        self.assertTrue(res['success'])

        # Verify
        res = self.registry.execute('read_file', {'path': 'calc.py'})
        self.assertIn('# fixed', res['result'])

    def test_edit_file_non_unique_fails(self):
        # Create file with repeated string
        self.registry.execute('create_file', {'path': 'repeat.py', 'content': 'x = 1\nx = 1\n'})

        res = self.registry.execute('edit_file', {
            'path': 'repeat.py',
            'old_string': 'x = 1',
            'new_string': 'x = 2',
        })
        self.assertFalse(res['success'])
        self.assertIn('appears 2 times', res.get('error', res.get('result', '')))

    def test_create_existing_file_fails(self):
        self.registry.execute('create_file', {'path': 'exists.py', 'content': 'x = 1'})
        res = self.registry.execute('create_file', {'path': 'exists.py', 'content': 'x = 2'})
        self.assertFalse(res['success'])


class TestContext(unittest.TestCase):
    def test_token_estimation(self):
        text = "def hello(): print('world')"
        tokens = estimate_tokens(text)
        self.assertGreater(tokens, 0)
        self.assertLess(tokens, 50)

    def test_context_budget_trimming(self):
        cm = ContextManager(context_limit=500, keep_recent=2)
        # Add 10 steps
        for i in range(10):
            cm.add_step({
                'step': i + 1,
                'tool': 'read_file',
                'tool_args': {'path': f'file_{i}.py'},
                'tool_result': 'some content here',
            })

        messages, info = cm.build_messages(
            system_prompt="You are a helper.",
            task="Fix the bug.",
            plan="1. Read files\n2. Fix",
            full_message_history=[
                {'role': 'system', 'content': '...'},
                {'role': 'user', 'content': '...'},
            ] + [{'role': 'assistant', 'content': f'step {i}'} for i in range(10)],
        )

        self.assertLessEqual(info['total_tokens'], 500)
        self.assertGreater(len(messages), 0)


class TestPlan(unittest.TestCase):
    def setUp(self):
        self.temp_file = tempfile.mktemp(suffix='.md')
        self.pm = PlanManager(self.temp_file)

    def tearDown(self):
        if os.path.exists(self.temp_file):
            os.remove(self.temp_file)

    def test_plan_lifecycle(self):
        self.assertEqual(self.pm.read(), '(No plan yet)')
        self.pm.write('# Initial Plan\n')
        self.assertIn('Initial Plan', self.pm.read())
        self.pm.update_step(1, 'Read math_utils.py')
        self.assertIn('Step 1', self.pm.read())
        self.assertIn('Read math_utils.py', self.pm.read())


class TestReport(unittest.TestCase):
    def test_report_building(self):
        summary = build_report(
            task="Fix bug",
            project_root="/tmp/project",
            run_id="run_123",
            steps=[{'step': 1, 'tokens_in': 100, 'tokens_out': 50}],
            stop_reason="finish",
            start_time=1000.0,
            end_time=1010.0,
            tool_counts={'read_file': 1},
            model_info={'role': 'main', 'name': 'gemma4:latest'},
            status='success',
        )
        self.assertEqual(summary['status'], 'success')
        self.assertEqual(summary['total_tokens_in'], 100)
        self.assertEqual(summary['total_time_seconds'], 10.0)

        text = format_report_text(summary)
        self.assertIn('SUCCESS', text)
        self.assertIn('run_123', text)


class TestStacks(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.mkdtemp()

    def tearDown(self):
        shutil.rmtree(self.temp_dir)

    def test_detect_python_stack(self):
        from agent.stacks import detect_single_primary_stack
        with open(os.path.join(self.temp_dir, 'main.py'), 'w') as f:
            f.write("print('hello')")
        stack = detect_single_primary_stack(self.temp_dir)
        self.assertEqual(stack.name, 'python')

    def test_detect_nextjs_stack(self):
        from agent.stacks import detect_single_primary_stack
        pkg = {
            "dependencies": {"next": "^14.0.0", "react": "^18.2.0"}
        }
        with open(os.path.join(self.temp_dir, 'package.json'), 'w') as f:
            import json
            json.dump(pkg, f)
        with open(os.path.join(self.temp_dir, 'next.config.mjs'), 'w') as f:
            f.write("export default {}")

        stack = detect_single_primary_stack(self.temp_dir)
        self.assertEqual(stack.name, 'nextjs')

    def test_detect_vite_stack(self):
        from agent.stacks import detect_single_primary_stack
        with open(os.path.join(self.temp_dir, 'vite.config.ts'), 'w') as f:
            f.write("export default {}")
        stack = detect_single_primary_stack(self.temp_dir)
        self.assertEqual(stack.name, 'vite')

    def test_stack_mismatch_fails_validation(self):
        from agent.stacks import validate_and_resolve_stack
        with open(os.path.join(self.temp_dir, 'utils.py'), 'w') as f:
            f.write("x = 1")
        is_valid, msg, res = validate_and_resolve_stack(self.temp_dir, requested_stack="nextjs")
        self.assertFalse(is_valid)
        self.assertIn("Stack mismatch", msg)

    def test_mixed_stack_is_rejected(self):
        from agent.stacks import validate_and_resolve_stack
        with open(os.path.join(self.temp_dir, 'main.py'), 'w') as f:
            f.write("x = 1")
        is_valid, msg, res = validate_and_resolve_stack(self.temp_dir, requested_stack="python,vite")
        self.assertFalse(is_valid)
        self.assertIn("Only ONE stack can be selected at a time", msg)

    def test_auto_stack_resolves_cleanly(self):
        from agent.stacks import validate_and_resolve_stack
        with open(os.path.join(self.temp_dir, 'app.py'), 'w') as f:
            f.write("x = 1")
        is_valid, msg, res = validate_and_resolve_stack(self.temp_dir, requested_stack="auto")
        self.assertTrue(is_valid)
        self.assertEqual(res.name, "python")
        self.assertIn("python", res.allowed_commands)

    def test_empty_dir_defaults_to_nextjs_typescript(self):
        from agent.stacks import validate_and_resolve_stack
        # Empty folder with no files must default to Next.js TypeScript
        is_valid, msg, res = validate_and_resolve_stack(self.temp_dir, requested_stack="auto")
        self.assertTrue(is_valid)
        self.assertEqual(res.name, "nextjs")
        self.assertIn("npm", res.allowed_commands)
        self.assertIn("next", res.allowed_commands)
        self.assertIn(".tsx", res.file_extensions)


class TestSandboxesRouting(unittest.TestCase):
    def test_run_tracer_explicit_run_dir(self):
        temp_dir = tempfile.mkdtemp()
        try:
            custom_dir = os.path.join(temp_dir, 'custom_run_123')
            tracer = RunTracer('run_123', run_dir=custom_dir)
            self.assertEqual(tracer.run_dir, custom_dir)
            self.assertTrue(os.path.isdir(custom_dir))
            self.assertTrue(os.path.isfile(tracer.plan_path))
            self.assertTrue(os.path.isfile(tracer.timeline_path))
        finally:
            shutil.rmtree(temp_dir)

    def test_run_tracer_records_timeline_and_history(self):
        temp_dir = tempfile.mkdtemp()
        try:
            target_dir = os.path.join(temp_dir, 'drafts', 'test_draft')
            run_dir = os.path.join(target_dir, 'run_abc')
            tracer = RunTracer('run_abc', run_dir=run_dir)

            # Test timeline recording
            tracer.record_event(Event(
                event_id='e1', run_id='run_abc', timestamp=time.time(),
                type='step.progress', payload={'description': 'Analyzing project'}
            ))
            self.assertTrue(os.path.isfile(tracer.timeline_path))
            with open(tracer.timeline_path, 'r', encoding='utf-8') as f:
                timeline_content = f.read()
            self.assertIn('Analyzing project', timeline_content)

            # Test REPORT.md writing
            report_md = "# Run Report: test"
            tracer.write_markdown_report(report_md)
            self.assertTrue(os.path.isfile(tracer.report_path))

            # Test RUNS.md ledger update
            summary = {
                'run_id': 'run_abc',
                'task': 'Create login card',
                'status': 'success',
                'total_time_seconds': 3.5,
                'files_modified': ['app/login.tsx'],
                'started_at': '2026-10-01T14:00:00',
            }
            tracer.update_history_catalog(summary)
            runs_md = os.path.join(target_dir, 'RUNS.md')
            self.assertTrue(os.path.isfile(runs_md))
            with open(runs_md, 'r', encoding='utf-8') as f:
                runs_content = f.read()
            self.assertIn('Execution History', runs_content)
            self.assertIn('run_abc', runs_content)
            self.assertIn('Create login card', runs_content)
        finally:
            shutil.rmtree(temp_dir)

    def test_agentic_runs_not_created(self):
        agentic_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        agentic_runs = os.path.join(agentic_dir, 'runs')
        self.assertFalse(os.path.exists(agentic_runs), "agentic/runs/ must not exist")


if __name__ == '__main__':
    unittest.main()
