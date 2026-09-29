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
from pathlib import Path
from agent.events import Event

class RunTracer:
    """Records events and run summaries to disk. Writes incrementally so a crash leaves a usable record."""
    
    def __init__(self, run_id: str, base_dir: str = 'runs'):
        self.run_id = run_id
        self.run_dir = os.path.join(base_dir, run_id)
        os.makedirs(self.run_dir, exist_ok=True)
        os.makedirs(os.path.join(self.run_dir, 'artifacts'), exist_ok=True)
        
        self._events_path = os.path.join(self.run_dir, 'events.jsonl')
        self._summary_path = os.path.join(self.run_dir, 'run.json')
        self.plan_path = os.path.join(self.run_dir, 'plan.md')
        
        # Create empty plan file
        if not os.path.exists(self.plan_path):
            with open(self.plan_path, 'w') as f:
                f.write('# Plan\n\n(No plan yet)\n')
    
    def record_event(self, event: Event):
        """Append an event to events.jsonl. Writes immediately and flushes."""
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
    
    def write_summary(self, summary: dict):
        """Write the final run.json summary."""
        with open(self._summary_path, 'w', encoding='utf-8') as f:
            json.dump(summary, f, indent=2, default=str)
