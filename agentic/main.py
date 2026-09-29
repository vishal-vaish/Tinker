"""
Mini Coding Agent — CLI Entry Point

Usage:
    python main.py --project <path> --task "your task description"
    python main.py --project ./eval/tasks/off_by_one --task "Explain what this project does"

Options:
    --project   Path to the project directory (required)
    --task      Task description (required)
    --config    Path to config.toml (default: config.toml in same dir as main.py)
"""
import argparse
import os
import sys
import signal
import time
from datetime import datetime

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


# ─── CLI Event Handlers (thin display layer, no agent logic) ─────────────────

def on_run_started(event: Event):
    """Display run start info."""
    p = event.payload
    print()
    print("╔══════════════════════════════════════════════════════════════╗")
    print("║                    MINI CODING AGENT                       ║")
    print("╚══════════════════════════════════════════════════════════════╝")
    print(f"  Run ID:   {event.run_id}")
    print(f"  Task:     {p.get('task', '')[:80]}")
    print(f"  Project:  {p.get('project_root', '')}")
    print(f"  Model:    {p.get('config', {}).get('model_main', 'unknown')}")
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
    parser.add_argument('--project', required=True, help='Path to the project directory')
    parser.add_argument('--task', required=True, help='Task description for the agent')
    parser.add_argument('--config', default=None, help='Path to config.toml (default: auto-detect)')
    
    args = parser.parse_args()
    
    # Resolve paths
    project_root = os.path.abspath(args.project)
    if not os.path.isdir(project_root):
        print(f"Error: Project directory not found: {project_root}", file=sys.stderr)
        sys.exit(1)
    
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
        summary = agent.run(task=args.task, project_root=project_root)
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
