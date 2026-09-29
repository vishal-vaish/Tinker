"""
eval.runner — Automated Evaluation Benchmark Runner

WHAT THIS FILE DOES:
- Discovers all sample tasks under eval/tasks/.
- Runs the agent sequentially on each task with configurable options (thinking, best-of-n, fallback).
- Records all results (pass/fail, steps, tokens, duration, stop reason) to SQLite (data/agent.db).
- Supports best-of-N attempts (runs up to N tries, keeping the first passing result).
- Displays formatted terminal comparison tables and past evaluation history (--history).

Usage:
    python -m eval.runner                              # Run with defaults
    python -m eval.runner --config config.toml         # Custom config
    python -m eval.runner --thinking                   # Enable thinking mode
    python -m eval.runner --best-of-n 3                # Best of 3 attempts
    python -m eval.runner --no-fallback                # Disable fallback model
    python -m eval.runner --history                    # Display previous benchmark runs
"""
import argparse
import json
import os
import sys
import sqlite3
import time
from datetime import datetime
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from agent.config import AgentConfig
from agent.models import OllamaClient
from agent.events import EventEmitter
from agent.loop import AgentLoop


# SQLite schema
CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS eval_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_name TEXT NOT NULL,
    task_description TEXT,
    config_name TEXT,
    model_main TEXT,
    model_fallback TEXT,
    thinking INTEGER DEFAULT 0,
    best_of_n INTEGER DEFAULT 1,
    fallback_enabled INTEGER DEFAULT 1,
    passed INTEGER DEFAULT 0,
    steps INTEGER DEFAULT 0,
    time_seconds REAL DEFAULT 0.0,
    tokens_in INTEGER DEFAULT 0,
    tokens_out INTEGER DEFAULT 0,
    retries INTEGER DEFAULT 0,
    stop_reason TEXT,
    run_id TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
"""


def discover_tasks(tasks_dir: str) -> list[dict]:
    """Discover all sample projects under tasks_dir."""
    tasks = []
    if not os.path.isdir(tasks_dir):
        return tasks
    
    for name in sorted(os.listdir(tasks_dir)):
        task_dir = os.path.join(tasks_dir, name)
        if not os.path.isdir(task_dir):
            continue
        
        task_file = os.path.join(task_dir, 'task.txt')
        if not os.path.isfile(task_file):
            continue
        
        with open(task_file, 'r', encoding='utf-8') as f:
            description = f.read().strip()
        
        tasks.append({
            'name': name,
            'path': task_dir,
            'description': description,
        })
    
    return tasks


def init_db(db_path: str) -> sqlite3.Connection:
    """Initialize SQLite database."""
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.execute(CREATE_TABLE_SQL)
    conn.commit()
    return conn


def save_result(conn: sqlite3.Connection, result: dict):
    """Save a task result to the database."""
    conn.execute("""
        INSERT INTO eval_runs (
            task_name, task_description, config_name,
            model_main, model_fallback,
            thinking, best_of_n, fallback_enabled,
            passed, steps, time_seconds,
            tokens_in, tokens_out, retries,
            stop_reason, run_id, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        result['task_name'], result.get('task_description', ''),
        result.get('config_name', 'default'),
        result['model_main'], result.get('model_fallback', ''),
        int(result.get('thinking', False)),
        result.get('best_of_n', 1),
        int(result.get('fallback_enabled', True)),
        int(result.get('passed', False)),
        result.get('steps', 0),
        result.get('time_seconds', 0.0),
        result.get('tokens_in', 0),
        result.get('tokens_out', 0),
        result.get('retries', 0),
        result.get('stop_reason', 'unknown'),
        result.get('run_id', ''),
        datetime.now().isoformat(),
    ))
    conn.commit()


def run_single_task(task: dict, config: AgentConfig, 
                    settings: dict) -> dict:
    """
    Run the agent on a single task.
    
    Returns a result dict with pass/fail, steps, time, tokens, etc.
    """
    project_root = os.path.abspath(task['path'])
    task_desc = task['description']
    
    # Create fresh components for each task
    emitter = EventEmitter()
    model = OllamaClient(config)
    # AgentLoop initializes tools and safety per-project inside run()
    agent = AgentLoop(config, model, emitter)
    
    start_time = time.time()
    try:
        summary = agent.run(task=task_desc, project_root=project_root)
    except Exception as e:
        summary = {
            'status': 'error',
            'stop_reason': f'{type(e).__name__}: {e}',
            'steps_used': 0,
            'total_tokens_in': 0,
            'total_tokens_out': 0,
            'run_id': 'error',
        }
    end_time = time.time()
    
    main_config = config.get_model_config('main')
    fallback_config = config.get_model_config('fallback')
    
    return {
        'task_name': task['name'],
        'task_description': task_desc,
        'model_main': main_config.model,
        'model_fallback': fallback_config.model,
        'thinking': settings.get('thinking', False),
        'best_of_n': settings.get('best_of_n', 1),
        'fallback_enabled': settings.get('fallback_enabled', True),
        'passed': summary.get('status') == 'success',
        'steps': summary.get('steps_used', 0),
        'time_seconds': round(end_time - start_time, 2),
        'tokens_in': summary.get('total_tokens_in', 0),
        'tokens_out': summary.get('total_tokens_out', 0),
        'retries': 0,  # TODO: track retries in loop
        'stop_reason': summary.get('stop_reason', 'unknown'),
        'run_id': summary.get('run_id', ''),
    }


def print_results_table(results: list[dict]):
    """Print a formatted results table."""
    print()
    print("=" * 90)
    print(f"{'Task':<22} {'Pass':>5} {'Steps':>6} {'Time':>8} {'Tokens':>12} {'Stop Reason'}")
    print("-" * 90)
    
    passed_count = 0
    total_count = len(results)
    
    for r in results:
        status = '✅' if r['passed'] else '❌'
        tokens = f"{r['tokens_in']}+{r['tokens_out']}"
        time_str = f"{r['time_seconds']:.1f}s"
        stop = r['stop_reason'][:30]
        print(f"  {r['task_name']:<20} {status:>5} {r['steps']:>6} {time_str:>8} {tokens:>12} {stop}")
        if r['passed']:
            passed_count += 1
    
    print("-" * 90)
    pct = (passed_count / total_count * 100) if total_count > 0 else 0
    print(f"  TOTAL: {passed_count}/{total_count} passed ({pct:.0f}%)")
    print("=" * 90)
    print()


def print_history(conn: sqlite3.Connection):
    """Print history of all eval runs from the database."""
    cursor = conn.execute("""
        SELECT task_name, model_main, thinking, best_of_n, 
               passed, steps, time_seconds, tokens_in, tokens_out,
               stop_reason, created_at
        FROM eval_runs
        ORDER BY created_at DESC
        LIMIT 50
    """)
    
    rows = cursor.fetchall()
    if not rows:
        print("No previous eval runs found.")
        return
    
    print()
    print("=" * 100)
    print("EVAL HISTORY (last 50 runs)")
    print("-" * 100)
    print(f"{'Time':<20} {'Task':<20} {'Model':<20} {'Think':>5} {'BoN':>4} {'Pass':>5} {'Steps':>6} {'Time':>7}")
    print("-" * 100)
    
    for row in rows:
        task, model, think, bon, passed, steps, t, ti, to, reason, created = row
        status = '✅' if passed else '❌'
        think_str = 'Y' if think else 'N'
        time_str = f"{t:.1f}s"
        created_short = created[:16] if created else '?'
        print(f"  {created_short:<20} {task:<20} {model:<20} {think_str:>5} {bon:>4} {status:>5} {steps:>6} {time_str:>7}")
    
    print("=" * 100)
    print()


def main():
    parser = argparse.ArgumentParser(description='Eval runner for Mini Coding Agent')
    parser.add_argument('--config', default=None, help='Path to config.toml')
    parser.add_argument('--tasks-dir', default=None, help='Path to tasks directory')
    parser.add_argument('--thinking', action='store_true', help='Enable thinking mode')
    parser.add_argument('--best-of-n', type=int, default=1, help='Best of N attempts')
    parser.add_argument('--no-fallback', action='store_true', help='Disable fallback model')
    parser.add_argument('--history', action='store_true', help='Show eval history and exit')
    
    args = parser.parse_args()
    
    # Find paths
    base_dir = str(Path(__file__).parent.parent)
    
    config_path = args.config or os.path.join(base_dir, 'config.toml')
    tasks_dir = args.tasks_dir or os.path.join(base_dir, 'eval', 'tasks')
    db_path = os.path.join(base_dir, 'data', 'agent.db')
    
    if not os.path.isfile(config_path):
        print(f"Error: Config file not found: {config_path}", file=sys.stderr)
        sys.exit(1)
    
    # Load config
    config = AgentConfig(config_path)
    
    # Initialize database
    conn = init_db(db_path)
    
    if args.history:
        print_history(conn)
        conn.close()
        return
    
    # Discover tasks
    tasks = discover_tasks(tasks_dir)
    if not tasks:
        print(f"No tasks found in: {tasks_dir}", file=sys.stderr)
        sys.exit(1)
    
    print(f"\nDiscovered {len(tasks)} tasks in {tasks_dir}")
    for t in tasks:
        print(f"  - {t['name']}: {t['description'][:60]}")
    
    settings = {
        'thinking': args.thinking,
        'best_of_n': args.best_of_n,
        'fallback_enabled': not args.no_fallback,
    }
    
    main_model = config.get_model_config('main')
    print(f"\nModel: {main_model.model}")
    print(f"Settings: thinking={settings['thinking']}, best_of_n={settings['best_of_n']}, fallback={settings['fallback_enabled']}")
    print()
    
    # Run each task
    results = []
    for i, task in enumerate(tasks, 1):
        print(f"[{i}/{len(tasks)}] Running: {task['name']}...")
        
        best_result = None
        for attempt in range(settings['best_of_n']):
            if settings['best_of_n'] > 1:
                print(f"  Attempt {attempt + 1}/{settings['best_of_n']}")
            
            result = run_single_task(task, config, settings)
            
            if best_result is None or result['passed']:
                best_result = result
            
            if result['passed']:
                break  # Stop on first success
        
        results.append(best_result)
        save_result(conn, best_result)
        
        status = '✅ PASS' if best_result['passed'] else '❌ FAIL'
        print(f"  → {status} ({best_result['steps']} steps, {best_result['time_seconds']:.1f}s)")
    
    # Print summary
    print_results_table(results)
    
    conn.close()
    print(f"Results saved to: {db_path}")


if __name__ == '__main__':
    main()
