"""
agent.tools package — Agent Tool Registry & Builtin Tools

WHAT THIS PACKAGE CONTAINS:
- registry.py: Tool definition dataclass, schema validation, and execution dispatcher.
- read_tools.py: Safe read-only inspection tools (list_files, read_file, search_text, finish).
- write_tools.py: Precise modification tools (edit_file with uniqueness checks, create_file).
- exec_tools.py: Command tools (run_command with allowlist/timeouts, run_tests with log filtering).
"""
