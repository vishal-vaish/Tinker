"""
agent.report — Final Run Report & Metric Builder

WHAT THIS FILE DOES:
- Compiles run execution statistics (steps used, tokens in/out, execution time, stop reason, status).
- Generates structured run summary dictionaries saved to run.json.
- Formats clean human-readable summaries printed to the terminal at the end of every run.
"""
import json
import os
from datetime import datetime


def build_report(
    task: str,
    project_root: str,
    run_id: str,
    steps: list[dict],
    stop_reason: str,
    start_time: float,
    end_time: float,
    tool_counts: dict[str, int],
    model_info: dict,
    status: str,
) -> dict:
    """
    Build the final run report.
    
    Args:
        task: The original task description
        project_root: Path to the project
        run_id: Unique run identifier
        steps: List of step records
        stop_reason: Why the run stopped
        start_time: Unix timestamp of run start
        end_time: Unix timestamp of run end
        tool_counts: Count of each tool used
        model_info: Model role and name used
        status: 'success', 'failed', or 'stopped'
    
    Returns:
        Complete run summary dict
    """
    total_tokens_in = sum(s.get('tokens_in', 0) for s in steps)
    total_tokens_out = sum(s.get('tokens_out', 0) for s in steps)
    duration = end_time - start_time

    summary = {
        'run_id': run_id,
        'task': task,
        'project_root': project_root,
        'status': status,
        'stop_reason': stop_reason,
        'steps_used': len(steps),
        'total_time_seconds': round(duration, 2),
        'total_tokens_in': total_tokens_in,
        'total_tokens_out': total_tokens_out,
        'tool_counts': tool_counts,
        'model': model_info,
        'started_at': datetime.fromtimestamp(start_time).isoformat(),
        'finished_at': datetime.fromtimestamp(end_time).isoformat(),
    }

    return summary


def format_report_text(summary: dict) -> str:
    """Format the run summary as human-readable text."""
    lines = [
        "=" * 60,
        "AGENT RUN REPORT",
        "=" * 60,
        f"  Run ID:      {summary['run_id']}",
        f"  Status:      {summary['status'].upper()}",
        f"  Stop reason: {summary['stop_reason']}",
        f"  Task:        {summary['task'][:100]}",
        f"  Project:     {summary['project_root']}",
        "",
        f"  Steps:       {summary['steps_used']}",
        f"  Time:        {summary['total_time_seconds']}s",
        f"  Tokens:      {summary['total_tokens_in']} in / {summary['total_tokens_out']} out",
        f"  Model:       {summary['model'].get('name', 'unknown')} ({summary['model'].get('role', 'unknown')})",
        "",
        "  Tools used:",
    ]
    for tool, count in sorted(summary.get('tool_counts', {}).items()):
        lines.append(f"    {tool}: {count}")
    
    lines.append("")
    lines.append(f"  Started:  {summary['started_at']}")
    lines.append(f"  Finished: {summary['finished_at']}")
    lines.append("=" * 60)

    return '\n'.join(lines)


def build_markdown_report(summary: dict, steps: list, diff_text: str = "") -> str:
    """Format the run summary as a comprehensive GitHub-flavored Markdown report."""
    run_id = summary.get('run_id', 'unknown')
    status = summary.get('status', 'unknown').upper()
    status_badge = "🟢 **SUCCESS**" if status == "SUCCESS" else f"🔴 **{status}**"
    stop_reason = summary.get('stop_reason', 'unknown')
    task = summary.get('task', '(No task specified)')
    project_root = summary.get('project_root', '')
    duration = summary.get('total_time_seconds', 0.0)
    tokens_in = summary.get('total_tokens_in', 0)
    tokens_out = summary.get('total_tokens_out', 0)
    total_tokens = tokens_in + tokens_out
    model_name = summary.get('model', {}).get('name', 'unknown')
    model_role = summary.get('model', {}).get('role', 'unknown')
    started_at = summary.get('started_at', '')
    finished_at = summary.get('finished_at', '')
    files_modified = summary.get('files_modified', [])
    tests_before = summary.get('tests_before', 'N/A')
    tests_after = summary.get('tests_after', 'N/A')

    # Files section
    if files_modified:
        files_section = "\n".join(f"- `{f}`" for f in files_modified)
    else:
        files_section = "*(No files modified)*"

    # Step rows
    step_rows = []
    for s in steps:
        step_num = s.get('step', '?')
        desc = (s.get('description') or '').replace('|', '\\|')
        tool = s.get('tool_call', {}).get('tool') or s.get('tool', 'model_think')
        result_prev = (s.get('tool_result') or s.get('content') or '').strip().split('\n')[0][:80].replace('|', '\\|')
        step_rows.append(f"| {step_num} | {desc or 'Execution step'} | `{tool}` | {result_prev or 'Completed'} |")

    step_table = "\n".join(step_rows) if step_rows else "| 1 | Task initialized | `setup` | Completed |"

    # Tool counts table
    tool_counts_list = []
    for t_name, count in sorted(summary.get('tool_counts', {}).items()):
        tool_counts_list.append(f"- **`{t_name}`**: {count} call(s)")
    tool_counts_str = "\n".join(tool_counts_list) if tool_counts_list else "*(None)*"

    # Diff block
    if diff_text and diff_text.strip():
        diff_block = f"```diff\n{diff_text.strip()}\n```"
    else:
        diff_block = "*(No code diff produced)*"

    md = f"""# 🚀 Execution Report: `{run_id}`

> **Status**: {status_badge} | **Stop Reason**: `{stop_reason}` | **Duration**: `{duration}s` | **Tokens**: `{total_tokens}`

---

## 🎯 Task Prompt
> {task}

---

## 📊 Run Overview
| Attribute | Detail |
|---|---|
| **Target Directory** | `{project_root}` |
| **Model** | `{model_name}` (`{model_role}`) |
| **Total Steps** | `{summary.get('steps_used', len(steps))}` |
| **Duration** | `{duration} seconds` |
| **Tokens (In / Out / Total)** | `{tokens_in}` / `{tokens_out}` / `{total_tokens}` |
| **Verification Baseline (Before)** | `{tests_before}` |
| **Verification Final (After)** | `{tests_after}` |
| **Started At** | `{started_at}` |
| **Finished At** | `{finished_at}` |

---

## 📁 Files Touched
{files_section}

### Tools Invoked
{tool_counts_str}

---

## ⏱️ Step-by-Step Actions Timeline
| Step | Action Description | Tool Called | Outcome |
|---|---|---|---|
{step_table}

---

## 🔍 Code Changes (Diff)
{diff_block}
"""
    return md
