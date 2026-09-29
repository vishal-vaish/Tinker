# Requirements — Mini Coding Agent (v1.0)

## Milestone 1: Agent Core + CLI

### Functional Requirements

#### FR-1: Sample Test Projects
- 3–5 tiny Python projects under `eval/tasks/`
- Each has source files with intentional bugs, a correct `unittest` test suite, a `task.txt`, and verify command `python -m unittest`
- Tests fail before fix, pass after documented hand-written fix

#### FR-2: Configuration System
- `config.toml` with model roles (`main`: `gemma4:latest`, `fallback`: `qwen3.5:9b`), budgets, sandbox settings, accuracy levers
- Config is single source of truth — no model names in code
- Each role: provider, model name, context limit, thinking on/off, temperature, timeout

#### FR-3: Model Client
- One interface: send messages + tool definitions → receive text and/or tool calls + token usage + duration
- Ollama provider via local HTTP chat API
- Thinking toggle, cancellation, request timeout
- Fallback format: parse JSON `{"tool": "name", "args": {...}}` from plain text when no structured tool call returned
- After N consecutive invalid tool calls → switch to fallback role

#### FR-4: Agent Loop
- Observe → Diagnose → Decide → Act → Reflect → Continue/Retry/Stop
- One tool call per step
- Stop conditions: verification passes, step budget, time budget, retry limit, no-progress, user cancel (Ctrl+C)
- Every stop produces a final report

#### FR-5: Tool System
- Tool registry with JSON schema validation
- Read tools: `list_files`, `read_file`, `search_text`
- Write tools: `edit_file` (unique string replacement), `create_file` (fail if exists)
- Exec tools: `run_command` (allowlisted), `run_tests` (parsed output, never full log)
- Control: `finish`
- All outputs: short, structured, size-limited, truncation marker

#### FR-6: Sandbox & Permissions
- Path jail: resolve absolute + `..` + symlinks, refuse anything outside project root
- Command allowlist: only configured commands, no shell chaining, timeout + output cap
- Risk levels: read (auto), write (auto in jail), execute (allowlisted auto), destructive (always approval)
- Approvals via event emitter, timeout → deny
- Project snapshot before first edit (git commit or copy)
- Test files read-only by default, edit requires explicit approval

#### FR-7: Context Management
- Configurable working context limit (~8k tokens)
- Always keep: system prompt, task, current plan, last N steps
- Older steps → one-line summaries
- File loading by line range only
- Context budget reporting in trace every step

#### FR-8: Planning & Accuracy
- Scratchpad plan in `runs/<run_id>/plan.md`, re-read every step
- Retries include previous error
- Best-of-N independent attempts
- Fallback to stronger model after retry limit
- Final independent verification from clean state
- Stop if N consecutive test runs show no improvement

#### FR-9: Event System
- Events are the ONLY contract between agent and CLI
- Output: `run.started`, `step.progress`, `tool.call`, `tool.result`, `approval.request`, `run.finished`, `speech.summary`
- Input: `task.submit`, `approval.answer`, `run.cancel`
- Each event: event_id, run_id, timestamp, type, payload

#### FR-10: Tracing & Reporting
- `runs/<run_id>/events.jsonl` — append-only during run
- `runs/<run_id>/run.json` — summary at end
- Final report: what asked, what done, files changed (diff), tests before/after, stop reason, unresolved items
- Incremental writes — crash leaves usable record

#### FR-11: Eval Runner
- Run agent on all sample projects with chosen config
- Store results in SQLite: pass/fail, steps, time, tokens, retries, model, settings
- Support different settings per run (thinking, best-of-N, fallback)
- Print pass/fail summary table

### Non-Functional Requirements

- **NFR-1:** One Python process, stdlib + one HTTP client only
- **NFR-2:** No hardware/GPU probing
- **NFR-3:** Speed is not a goal — slow is acceptable
- **NFR-4:** Never claim success unless verification passed
- **NFR-5:** No network access by the agent
