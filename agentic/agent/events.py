"""
agent.events — Decoupled Pub/Sub Event System

WHAT THIS FILE DOES:
- Serves as the sole interface and contract between the agent core and external channels (CLI, web UI, etc.).
- Defines standard event types (run.started, step.progress, tool.call, tool.result, approval.request, run.finished).
- Implements EventEmitter with thread-safe subscribe, synchronous emit, and blocking wait_for.
- Ensures the core agent logic never has direct dependencies on the CLI or frontend display code.
"""
import uuid
import time
import threading
from dataclasses import dataclass, field
from typing import Callable, Any

# Event type constants
RUN_STARTED = 'run.started'
STEP_PROGRESS = 'step.progress'
TOOL_CALL = 'tool.call'
TOOL_RESULT = 'tool.result'
APPROVAL_REQUEST = 'approval.request'
RUN_FINISHED = 'run.finished'
SPEECH_SUMMARY = 'speech.summary'
TASK_SUBMIT = 'task.submit'
APPROVAL_ANSWER = 'approval.answer'
RUN_CANCEL = 'run.cancel'

@dataclass
class Event:
    event_id: str
    run_id: str
    timestamp: float
    type: str
    payload: dict
    step: int | None = None

class EventEmitter:
    """Pub/sub event system. Synchronous emit, thread-safe subscribe."""
    
    def __init__(self):
        self._subscribers: dict[str | None, list[Callable]] = {}
        self._lock = threading.Lock()
        self._current_run_id: str = ''
    
    def set_run_id(self, run_id: str):
        self._current_run_id = run_id
    
    def subscribe(self, event_type: str | None, callback: Callable[[Event], None]):
        """Subscribe to an event type. None = subscribe to ALL events."""
        with self._lock:
            self._subscribers.setdefault(event_type, []).append(callback)
    
    def emit(self, event_type: str, payload: dict, run_id: str = '', step: int | None = None) -> Event:
        """Emit an event. Returns the created Event."""
        event = Event(
            event_id=str(uuid.uuid4()),
            run_id=run_id or self._current_run_id,
            timestamp=time.time(),
            type=event_type,
            payload=payload,
            step=step,
        )
        # Notify type-specific subscribers
        with self._lock:
            callbacks = list(self._subscribers.get(event_type, []))
            callbacks += list(self._subscribers.get(None, []))  # wildcard
        for cb in callbacks:
            cb(event)
        return event
    
    def wait_for(self, event_type: str, timeout: float | None = None) -> Event | None:
        """Block until an event of the given type is emitted. Returns None on timeout."""
        result = [None]
        received = threading.Event()
        
        def handler(event):
            result[0] = event
            received.set()
        
        self.subscribe(event_type, handler)
        received.wait(timeout=timeout)
        return result[0]
