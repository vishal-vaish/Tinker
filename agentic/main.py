"""
Mini Coding Agent — CLI Entry Point

WHAT THIS FILE DOES:
- Serves as the primary user-facing command-line interface.
- Parses command line arguments (--project, --task, --config).
- Sets up core components (Config, Ollama client, AgentLoop, EventEmitter).
- Subscribes thin event listeners to render colored progress to the terminal.
- Captures Ctrl+C for clean cancellations.
- Contains NO core agent logic (follows the event contract strictly).

Usage:
    python main.py --project <path> --task "your task description"
    python main.py --project ./eval/tasks/off_by_one --task "Explain what this project does"
"""
import argparse
import os
import sys
import signal
import time
import re
import uuid
from datetime import datetime

# Configure stdout and stderr for UTF-8 on Windows consoles
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Add parent directory to path so 'agent' package is importable
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from agent.config import AgentConfig
from agent.models import OllamaClient
from agent.events import (
    EventEmitter, Event,
    RUN_STARTED, STEP_PROGRESS, TOOL_CALL, TOOL_RESULT,
    RUN_FINISHED, SPEECH_SUMMARY, APPROVAL_REQUEST,
)
from agent.loop import AgentLoop
from agent.report import format_report_text
from agent.stacks import StackValidationError


# ─── CLI Event Handlers (thin display layer, no agent logic) ─────────────────

def on_run_started(event: Event):
    """Display run start info."""
    p = event.payload
    print()
    print("╔══════════════════════════════════════════════════════════════╗")
    print("║                    MINI CODING AGENT                         ║")
    print("╚══════════════════════════════════════════════════════════════╝")
    print(f"  Run ID:   {event.run_id}")
    print(f"  Task:     {p.get('task', '')[:80]}")
    target_type = "Draft" if p.get('is_draft') else "Project"
    print(f"  Target:   [{target_type}] {p.get('project_root', '')}")
    if p.get('run_dir'):
        print(f"  Trace:    {p.get('run_dir')}")
    print(f"  Model:    {p.get('config', {}).get('model_main', 'unknown')}")
    if p.get('stack'):
        print(f"  Stack:    {p.get('stack')}")
    print(f"  Budget:   {p.get('config', {}).get('max_steps', '?')} steps / "
          f"{p.get('config', {}).get('max_time_seconds', '?')}s")
    print("─" * 62)
    print()


def on_step_progress(event: Event):
    """Display step progress."""
    p = event.payload
    step = p.get('step', '?')
    desc = p.get('description', '')
    elapsed = p.get('elapsed', '')
    elapsed_str = f" [{elapsed}s]" if elapsed else ""
    print(f"  ⏳ {desc}{elapsed_str}")


def on_tool_call(event: Event):
    """Display tool call."""
    p = event.payload
    tool = p.get('tool', '?')
    args = p.get('arguments', {})
    # Format args concisely
    args_str = ', '.join(f'{k}={repr(v)[:50]}' for k, v in args.items())
    print(f"  🔧 {tool}({args_str})")


def on_tool_result(event: Event):
    """Display tool result (truncated)."""
    p = event.payload
    tool = p.get('tool', '?')
    success = p.get('success', True)
    result = str(p.get('result', ''))
    
    if success:
        # Show first few lines of result
        lines = result.split('\n')
        preview = lines[0][:100] if lines else ''
        if len(lines) > 1:
            preview += f" (+{len(lines)-1} more lines)"
        print(f"  ✅ → {preview}")
    else:
        print(f"  ❌ → {result[:120]}")
    print()


def on_run_finished(event: Event):
    """Display run completion."""
    p = event.payload
    status = p.get('status', 'unknown')
    reason = p.get('stop_reason', 'unknown')
    steps = p.get('steps', 0)
    run_dir = p.get('run_dir', '')
    
    print()
    print("─" * 62)
    status_emoji = "✅" if status == 'success' else "⏹️"
    print(f"  {status_emoji} Run finished: {status.upper()}")
    print(f"     Reason: {reason}")
    print(f"     Steps:  {steps}")
    print(f"     Trace:  {run_dir}")
    print()


def on_speech_summary(event: Event):
    """Display speech summary."""
    p = event.payload
    text = p.get('text', '')
    if text:
        print()
        print("  💬 Summary:")
        # Wrap text nicely
        for line in text.split('\n'):
            print(f"     {line}")
        print()


# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description='Mini Coding Agent — explores projects and answers questions',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python main.py --project ./eval/tasks/off_by_one --task "Explain what this project does"
  python main.py --project ./eval/tasks/small_feature --task "What tests are failing and why?"
        """
    )
    parser.add_argument('--project', default=None, help='Project name in sandboxes/projects/ or directory path')
    parser.add_argument('--draft', default=None, help='Draft name in sandboxes/drafts/ or directory path')
    parser.add_argument('--task', required=True, help='Task description for the agent')
    parser.add_argument('--stack', default='auto',
                        choices=['auto', 'python', 'html', 'react', 'vite', 'nextjs'],
                        help='Target framework stack (one at a time: auto, python, html, react, vite, nextjs). Default: auto')
    parser.add_argument('--config', default=None, help='Path to config.toml (default: auto-detect)')
    
    args = parser.parse_args()
    
    if not args.project and not args.draft:
        print("Error: Either --project or --draft must be specified.", file=sys.stderr)
        sys.exit(1)
    if args.project and args.draft:
        print("Error: Cannot specify both --project and --draft simultaneously. Choose one target.", file=sys.stderr)
        sys.exit(1)

    repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sandboxes_root = os.path.join(repo_root, 'sandboxes')

    if args.draft:
        is_draft = True
        raw_target = args.draft.strip()

        # 1. Direct path passed
        if os.path.isdir(raw_target):
            project_root = os.path.abspath(raw_target)
        # 2. Existing draft ID passed to continue working in this thread
        elif raw_target.startswith("draft_") and os.path.isdir(os.path.join(sandboxes_root, 'drafts', raw_target)):
            project_root = os.path.join(sandboxes_root, 'drafts', raw_target)
        else:
            # 3. New draft requested with a slug/name: generate unique collision-free draft ID
            clean_name = re.sub(r'[^a-zA-Z0-9_-]', '_', raw_target).strip('_') or 'canvas'
            unique_id = uuid.uuid4().hex[:6]
            draft_folder_name = f"draft_{clean_name}_{unique_id}"
            sandbox_draft = os.path.join(sandboxes_root, 'drafts', draft_folder_name)
            os.makedirs(sandbox_draft, exist_ok=True)
            project_root = sandbox_draft
    else:
        is_draft = False
        raw_target = args.project
        if os.path.isdir(raw_target):
            project_root = os.path.abspath(raw_target)
        else:
            sandbox_proj = os.path.join(sandboxes_root, 'projects', raw_target)
            if not os.path.isdir(sandbox_proj):
                os.makedirs(sandbox_proj, exist_ok=True)
            project_root = sandbox_proj
    
    # Find config
    if args.config:
        config_path = os.path.abspath(args.config)
    else:
        # Look for config.toml next to main.py
        config_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'config.toml')
    
    if not os.path.isfile(config_path):
        print(f"Error: Config file not found: {config_path}", file=sys.stderr)
        sys.exit(1)
    
    # Load config
    try:
        config = AgentConfig(config_path)
    except Exception as e:
        print(f"Error loading config: {e}", file=sys.stderr)
        sys.exit(1)
    
    # Create components
    emitter = EventEmitter()
    model = OllamaClient(config)
    # Create agent loop (tools and safety are initialized per-project inside run())
    agent = AgentLoop(config, model, emitter)
    
    # Subscribe CLI handlers to events (CLI is just a consumer — no agent logic here)
    emitter.subscribe(RUN_STARTED, on_run_started)
    emitter.subscribe(STEP_PROGRESS, on_step_progress)
    emitter.subscribe(TOOL_CALL, on_tool_call)
    emitter.subscribe(TOOL_RESULT, on_tool_result)
    emitter.subscribe(RUN_FINISHED, on_run_finished)
    emitter.subscribe(SPEECH_SUMMARY, on_speech_summary)
    
    # Handle Ctrl+C gracefully
    def signal_handler(sig, frame):
        print("\n\n  ⚠️  Ctrl+C received — stopping gracefully...")
        agent.cancel()
    
    signal.signal(signal.SIGINT, signal_handler)
    
    # Run the agent
    try:
        summary = agent.run(
            task=args.task,
            project_root=project_root,
            requested_stack=args.stack,
            is_draft=is_draft,
        )
    except StackValidationError as e:
        print(f"\n  ❌ Stack Verification Failed:\n     {e}\n", file=sys.stderr)
        sys.exit(1)
    except ConnectionError as e:
        print(f"\n  ❌ Cannot connect to Ollama: {e}")
        print("     Make sure Ollama is running: ollama serve")
        sys.exit(1)
    
    # Print final report
    print(format_report_text(summary))
    
    # Exit code: 0 for success, 1 for failure
    sys.exit(0 if summary.get('status') == 'success' else 1)


if __name__ == '__main__':
    main()
