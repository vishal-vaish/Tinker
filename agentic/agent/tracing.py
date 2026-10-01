"""
agent.tracing — Run Isolation & Trace Recorder

WHAT THIS FILE DOES:
- Establishes isolated run directories (runs/<run_id>/).
- Appends events to events.jsonl incrementally with immediate flushes (crash-resilient).
- Writes final run.json summaries and artifacts (diffs, test outputs).
- Ensures runs never overwrite or pollute each other.
"""
import json
import os
import time
from datetime import datetime
from pathlib import Path
from agent.events import (
    Event, RUN_STARTED, STEP_PROGRESS, TOOL_CALL, TOOL_RESULT,
    APPROVAL_REQUEST, RUN_FINISHED
)

class RunTracer:
    """Records events, readable timelines, run summaries, and catalogs to disk."""
    
    def __init__(self, run_id: str, base_dir: str = 'runs', run_dir: str = None):
        self.run_id = run_id
        if run_dir:
            self.run_dir = run_dir
        else:
            self.run_dir = os.path.join(base_dir, run_id)
        os.makedirs(self.run_dir, exist_ok=True)
        os.makedirs(os.path.join(self.run_dir, 'artifacts'), exist_ok=True)
        
        self._events_path = os.path.join(self.run_dir, 'events.jsonl')
        self._summary_path = os.path.join(self.run_dir, 'run.json')
        self.plan_path = os.path.join(self.run_dir, 'plan.md')
        self.timeline_path = os.path.join(self.run_dir, 'timeline.txt')
        self.report_path = os.path.join(self.run_dir, 'REPORT.md')
        
        # Create empty plan file
        if not os.path.exists(self.plan_path):
            with open(self.plan_path, 'w', encoding='utf-8') as f:
                f.write('# Plan\n\n(No plan yet)\n')

        # Initialize timeline.txt
        if not os.path.exists(self.timeline_path):
            with open(self.timeline_path, 'w', encoding='utf-8') as f:
                f.write(f"=== EXECUTION TIMELINE: {run_id} ===\n\n")
    
    def record_event(self, event: Event):
        """Append an event to events.jsonl and format clean lines in timeline.txt."""
        record = {
            'event_id': event.event_id,
            'run_id': event.run_id,
            'timestamp': event.timestamp,
            'type': event.type,
            'step': event.step,
            'payload': event.payload,
        }
        with open(self._events_path, 'a', encoding='utf-8') as f:
            f.write(json.dumps(record) + '\n')
            f.flush()

        # Format human-readable timeline entry
        timestr = datetime.fromtimestamp(event.timestamp).strftime('%H:%M:%S')
        p = event.payload or {}
        line = None
        if event.type == RUN_STARTED:
            task = p.get('task', '')[:90]
            stack = p.get('stack', 'unknown')
            target = p.get('project_root', '')
            line = f"[{timestr}] 🚀 RUN STARTED\n  Target: {target}\n  Stack:  {stack}\n  Task:   \"{task}\"\n"
        elif event.type == STEP_PROGRESS:
            desc = p.get('description', '')
            step_num = event.step or p.get('step', '?')
            line = f"[{timestr}] ⏳ STEP {step_num}: {desc}"
        elif event.type == TOOL_CALL:
            tool = p.get('tool', 'tool')
            args = p.get('arguments', {})
            args_str = ', '.join(f"{k}={repr(v)[:40]}" for k, v in args.items())
            step_num = event.step or p.get('step', '?')
            line = f"[{timestr}] 🔧 STEP {step_num}: TOOL CALL -> {tool}({args_str})"
        elif event.type == TOOL_RESULT:
            tool = p.get('tool', 'tool')
            success = p.get('success', True)
            res_str = str(p.get('result', '')).strip().split('\n')[0][:80]
            mark = 'OK' if success else 'FAIL'
            step_num = event.step or p.get('step', '?')
            line = f"[{timestr}] ✅ STEP {step_num}: TOOL RESULT [{mark}] -> {res_str}"
        elif event.type == APPROVAL_REQUEST:
            action = p.get('action', '')
            reason = p.get('reason', '')
            line = f"[{timestr}] ⚠️ APPROVAL REQUEST: {action} (Reason: {reason})"
        elif event.type == RUN_FINISHED:
            status = p.get('status', 'unknown').upper()
            reason = p.get('stop_reason', '')
            steps = p.get('steps', 0)
            line = f"\n[{timestr}] 🏁 RUN FINISHED: Status={status} ({reason}) across {steps} steps\n"

        if line:
            with open(self.timeline_path, 'a', encoding='utf-8') as f:
                f.write(line + '\n')
                f.flush()
    
    def write_summary(self, summary: dict):
        """Write the final run.json summary."""
        with open(self._summary_path, 'w', encoding='utf-8') as f:
            json.dump(summary, f, indent=2, default=str)

    def write_markdown_report(self, report_md: str):
        """Write the human-readable REPORT.md inside the run folder."""
        with open(self.report_path, 'w', encoding='utf-8') as f:
            f.write(report_md)

    def update_history_catalog(self, summary: dict):
        """Append this run to RUNS.md in the parent target directory."""
        parent_dir = os.path.dirname(self.run_dir)
        runs_md_path = os.path.join(parent_dir, 'RUNS.md')

        run_id = self.run_id
        target_name = os.path.basename(parent_dir)
        status = summary.get('status', 'unknown').upper()
        status_badge = "✅ SUCCESS" if status == "SUCCESS" else f"❌ {status}"
        task = (summary.get('task') or '').replace('|', '\\|')
        task_preview = task[:70] + ('...' if len(task) > 70 else '')
        duration = f"{summary.get('total_time_seconds', 0.0)}s"
        
        files_modified = summary.get('files_modified', [])
        if files_modified:
            files_str = ', '.join(f"`{f}`" for f in files_modified[:3])
            if len(files_modified) > 3:
                files_str += f" (+{len(files_modified)-3})"
        else:
            files_str = "None"

        started_at = summary.get('started_at', '')
        time_str = started_at.split('T')[-1][:8] if 'T' in started_at else ''

        row = f"| [`{run_id}`](./{run_id}/REPORT.md) | {time_str} | {status_badge} | {task_preview} | {files_str} | {duration} | [View Report](./{run_id}/REPORT.md) |\n"

        if not os.path.exists(runs_md_path):
            header = (
                f"# Execution History: `{target_name}`\n\n"
                f"Master ledger of all autonomous runs executed against this target.\n\n"
                f"| Run ID | Time | Status | Task Prompt | Files Touched | Duration | Report |\n"
                f"|---|---|---|---|---|---|---|\n"
            )
            with open(runs_md_path, 'w', encoding='utf-8') as f:
                f.write(header + row)
        else:
            with open(runs_md_path, 'a', encoding='utf-8') as f:
                f.write(row)

