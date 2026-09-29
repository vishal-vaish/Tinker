"""Final report builder for agent runs."""
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
