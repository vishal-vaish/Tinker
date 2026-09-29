"""
agent package — Mini Coding Agent Core Engine

WHAT THIS PACKAGE CONTAINS:
- loop.py: Main Observe-Diagnose-Decide-Act-Reflect autonomous cycle.
- models.py: Ollama HTTP client with native & fallback tool-call extraction.
- config.py: Typed configuration parser for config.toml.
- events.py: Decoupled pub/sub event bus.
- context.py: Token budget tracking and step summarization.
- plan.py: Scratchpad plan manager (plan.md).
- report.py: Run metrics and summary builder.
- tracing.py: Run isolation, events.jsonl, and artifacts recorder.
- tools/: Tool registry, read, write, and exec tool implementations.
- safety/: Path jail, command allowlist, and permission gate.
"""
