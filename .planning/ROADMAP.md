# Roadmap — Mini Coding Agent (v1.0)

## Milestone 1: Agent Core + CLI

### Phase 1: Sample Projects with Failing Tests
**Status:** 🟢 COMPLETE
**Scope:** 5 sample Python projects with intentional bugs and unittest suites.
**UAT:** Verified — all fail before fix, pass after fix.

### Phase 2: Config and Model Client
**Status:** 🟢 COMPLETE
**Scope:** config.toml with roles, Ollama client with fallback format parser.

### Phase 3: Read-Only Loop with Tracing
**Status:** 🟢 COMPLETE
**Scope:** Agent loop, read tools, event system, tracing, CLI entry point.

### Phase 4: Sandbox and Permissions
**Status:** 🟢 COMPLETE
**Scope:** Path jail, command allowlist, permission gate, test protection.

### Phase 5: Edit and Test Loop
**Status:** 🟢 COMPLETE
**Scope:** edit_file, create_file, run_command, run_tests, retry logic.

### Phase 6: Context Management
**Status:** 🟢 COMPLETE
**Scope:** Token estimation, step summarization, context window budget manager.

### Phase 7: Eval Runner + Accuracy Gate
**Status:** 🟢 COMPLETE
**Scope:** eval/runner.py with SQLite storage, best-of-N, and results table.
