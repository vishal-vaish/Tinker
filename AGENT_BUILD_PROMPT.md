# Mini Coding Agent — Agent Core Build Prompt

**Audience:** an implementing agent with zero prior context. Everything you need is in this document.
**Scope:** build ONLY the agent core, driven from a command-line interface. Do NOT build a backend, a web UI, voice, subagents, or design mode. Those come later.
**Do NOT** run hardware, GPU, or environment checks. Do not probe the machine. Assume Ollama is reachable at its default local address and that model names come from the config file.

---

# 1. Goal

Build a local coding agent that takes a coding task, explores a project folder, edits files, runs tests, reads the failures, and retries, all inside a sandbox with a permission system.

Priorities, in order:

1. **Accuracy.** A run succeeds only if the project's test command passes and the tests were not modified. The agent's own claim of success is never trusted.
2. **Safety.** The agent can never touch files outside the project root or run non-allowlisted commands.
3. **Traceability.** Every model call, tool call, approval, and result is recorded.
4. **Simplicity.** One Python process. Standard library plus one HTTP client. Ask before adding anything else.

Speed is not a goal. Slow is acceptable.

---

# 2. Working rules

- Build in the numbered steps below, in order.
- After each step: run that step's acceptance check, report what passed and what did not, and **wait for the owner's confirmation** before starting the next step.
- Do not silently change the architecture. If something in this document seems wrong or impossible, stop, explain, propose a change, and wait.
- Do not add dependencies beyond the Python standard library and one HTTP client without asking.
- Sample projects use Python's standard library `unittest` (run with `python -m unittest`), so no test framework needs installing.
- Write small, readable modules. No frameworks. No clever abstractions beyond those described here.

---

# 3. Project layout to create

```text
mini-agent/
├── config.toml                 # model roles, budgets, allowlist, paths
├── main.py                     # CLI entry point
├── agent/
│   ├── loop.py                 # the agent loop
│   ├── models.py               # model client (provider interface)
│   ├── context.py              # context management
│   ├── plan.py                 # scratchpad plan handling
│   ├── events.py               # event types + emitter
│   ├── report.py               # final report builder
│   ├── tools/
│   │   ├── registry.py         # tool definitions, schema validation
│   │   ├── read_tools.py       # list_files, read_file, search_text
│   │   ├── write_tools.py      # edit_file, create_file
│   │   └── exec_tools.py       # run_command, run_tests
│   └── safety/
│       ├── jail.py             # path jail
│       ├── allowlist.py        # command allowlist
│       └── permissions.py      # risk levels + approval gate
├── eval/
│   ├── tasks/                  # tiny sample projects with failing tests
│   └── runner.py               # runs the agent on all tasks (step 7)
├── runs/                       # per-run output (created at runtime)
└── data/agent.db               # SQLite (created at runtime, used by eval)
```

---

# 4. Design requirements

## 4.1 The loop

```text
Observe → Diagnose → Decide → Act → Reflect → Continue / Retry / Stop
```

- **Observe:** read the task, the current plan, and recent results.
- **Diagnose:** work out what state the project is in and what failed.
- **Decide:** choose the next action, one tool call at a time, or `finish`.
- **Act:** execute the tool through the permission gate and sandbox.
- **Reflect:** compare the result with what was expected (test results, exit codes).

**Stop conditions (all must be implemented):**

1. The verification command passes (success).
2. Step budget reached.
3. Time budget reached.
4. Retry limit reached for the same failure.
5. No progress: the same tool call with the same arguments repeated, or N consecutive steps with no file change and no new information.
6. User cancel (Ctrl+C handled cleanly).

Every stop produces a final report. Budgets and limits come from `config.toml`.

## 4.2 Model layer

- One internal interface: send messages plus tool definitions; receive text and/or tool calls; report token usage and duration; support cancellation; support a thinking on/off setting.
- Implement one provider: Ollama over its local HTTP chat API.
- `config.toml` defines **roles**, never model names in code: `main` and `fallback`. Each role sets provider, model name, context limit to use, thinking on/off, temperature, and request timeout.
- Model capabilities (whether a model supports tool calling well) are **unknown**. The tool layer must therefore be robust: validate every tool call's arguments against a schema before executing; on an invalid call, return a clear error message to the model, count it, and after N consecutive invalid calls switch to the `fallback` role; if that also fails, stop cleanly with a report.
- If a model does not return structured tool calls at all, support a documented fallback format (for example a single JSON object in the reply) parsed and validated the same way. Record which mode was used in the trace.

## 4.3 Tools (keep the set exactly this small)

| Tool | Behavior | Risk |
|---|---|---|
| `list_files` | list a directory inside the jail | read |
| `read_file` | read a file with size and line-range limits | read |
| `search_text` | grep-like search across the project | read |
| `edit_file` | replace a unique string in a file; fail loudly if the string is missing or appears more than once | write |
| `create_file` | create a new file; fail if it exists | write |
| `run_command` | run an allowlisted command with timeout and output cap | execute |
| `run_tests` | run the configured test command; return only failing test names and key error lines | execute |
| `finish` | declare completion with a summary | control |

Every tool returns short, structured, size-limited output with a clear truncation marker and a way to request more. `run_tests` must never return the full log.

## 4.4 Sandbox and permissions

- **Path jail:** the agent may touch only files inside the configured project root. Resolve every path to absolute form and check it **after** resolving `..` and symlinks. Anything outside is refused, and the attempt is traced.
- **Command allowlist:** only commands listed in `config.toml` may run (for example the test command, `git status`, `git diff`). No shell chaining or piping unless explicitly allowed. Every command has a timeout and an output size cap. No network commands.
- **Risk levels:**
  - read: auto-approved.
  - write: auto-approved inside the jail and traced; configurable to require approval.
  - execute: allowlisted commands auto-approved; anything else needs approval or is refused.
  - destructive (deleting files, overwriting many files, anything outside the allowlist): always needs explicit approval.
- **Approvals** are a yes/no question asked through the CLI. Route them through the event emitter (section 4.7) so a different channel could answer them later. A pending approval times out to **deny**.
- **Snapshot:** before the first edit of a run, snapshot the project (a git commit or a copy inside the run folder) so the run can be rolled back.
- **Test protection:** test files are read-only to the agent by default. Editing a test file needs explicit approval. A run counts as successful only if the verification command passes and no test file was modified.

## 4.5 Context management

- Configurable working context limit (start at about 8k tokens).
- Always keep: system prompt, task, current plan (read from the scratchpad file each step), and the last few steps in full.
- Older steps are replaced by one-line summaries (action, result, outcome).
- Files are loaded only when needed, by line range. Never load the whole project.
- Record context budget usage in the trace every step.

## 4.6 Planning and accuracy levers

- At the start of a run the agent writes a short plan to `runs/<run_id>/plan.md` and updates it as it goes. The plan is re-read every step.
- Accuracy is bought with time. Implement these as configurable options:
  1. Thinking mode on for planning and for diagnosing failures, where the model supports it.
  2. Retries that include the previous failed attempt and the exact error, so the model does not repeat it.
  3. Best-of-N: run up to N independent attempts and keep the first that passes verification.
  4. Fallback to the `fallback` model after the retry limit.
  5. A final independent verification: after the last edit, rerun the full test command from a clean state.
- Stop if N consecutive test runs show no improvement in the number of failing tests.

## 4.7 Events

The agent core communicates only through events, so a backend or UI can be attached later without changing it. Implement an emitter with these events (each carries event id, run id, timestamp, type, payload):

- Output: `run.started`, `step.progress`, `tool.call`, `tool.result`, `approval.request`, `run.finished`, `speech.summary` (one or two plain sentences, no code; produced even though nothing consumes it yet).
- Input: `task.submit`, `approval.answer`, `run.cancel`.

The CLI is just one consumer/producer of these events. No agent logic may live in the CLI.

## 4.8 Tracing and run isolation

```text
runs/<run_id>/
├── events.jsonl   # append-only, written during the run
├── run.json       # summary written at the end
├── plan.md        # scratchpad plan
├── snapshot/      # or a git reference
└── artifacts/     # diffs, test outputs, final report
```

- `events.jsonl` records per event: timestamp, step number, event type, model role and name, token counts, duration, and enough input and output to reconstruct the step.
- `run.json` records: task, config used, steps, tool counts, test results before and after, stop reason, total time, final status.
- Runs never merge. Write the trace incrementally so a crash leaves a usable record.

## 4.9 Final report

Each run ends with a report containing: what was asked, what was done, files changed with a diff, test results before and after, why the run stopped, and anything unresolved. If tests still fail, say so plainly. Never claim success unless verification passed.

---

# 5. Build steps and acceptance checks

## Step 1 — Sample projects with failing tests

Create 3 to 5 tiny Python projects under `eval/tasks/`. Each has: a few source files, a `unittest` test suite that **currently fails**, a `task.txt` describing the task in one or two sentences, and a `verify` command (`python -m unittest`).

Suggested set: (a) an off-by-one bug in one function; (b) a missing function that a test imports; (c) a wrong import or name error; (d) a small feature with tests already written; (e) a bug that spans two files.

**Acceptance:** for each project, running the verify command fails before any change, and a correct hand-written fix makes it pass. List each project, its failing test, and its intended fix.

## Step 2 — Config and model client

Create `config.toml` and the model client with the `main` and `fallback` roles, thinking toggle, timeouts, cancellation, and token/timing reporting.

**Acceptance:** a small script sends one plain message to the `main` role and prints the reply, token counts, and duration. A second script sends a message with one dummy tool definition and prints whether a valid tool call came back, and which mode (native or documented fallback format) was used. Do not treat a failure to get a tool call as a crash; report it.

## Step 3 — Read-only loop with tracing

Build the loop, the read tools (`list_files`, `read_file`, `search_text`, `finish`), budgets, all stop conditions, the event emitter, tracing to `events.jsonl` and `run.json`, and the CLI.

**Acceptance:** running the CLI on a sample project with the task "explain what this project does" produces an answer using only read tools, stays within the step and time budgets, stops correctly, and leaves a complete trace. Trigger the step-budget stop and the Ctrl+C stop on purpose and show the reports.

## Step 4 — Sandbox and permissions

Build the path jail, command allowlist, risk levels, approval gate through events, and snapshot.

**Acceptance:** automated tests show that reading `../` paths, absolute paths outside the root, and symlinks pointing outside are all refused; a non-allowlisted command is refused; a destructive action asks for approval and denies on timeout; every attempt appears in the trace.

## Step 5 — Edit and test loop

Add `edit_file`, `create_file`, `run_command`, `run_tests`, the retry logic with error feedback, no-progress detection, the scratchpad plan, test-file protection, and the final independent verification.

**Acceptance:** run the agent on each sample project and report, per project: pass or fail, steps used, time, retries, and whether test files were touched. Report failures honestly; do not tune the task descriptions to make the agent pass.

## Step 6 — Context management

Build context trimming, one-line step summaries, line-range file reading, and context budget reporting.

**Acceptance:** a task that needs 20 or more steps completes (or stops correctly) without exceeding the configured context limit, and the trace shows context use per step.

## Step 7 — Eval runner

Build `eval/runner.py`: one command that runs the agent on every sample project with a chosen model config and stores per-task results (pass/fail, steps, time, tokens, retries, model role and name, settings used) in SQLite, then prints a pass/fail table. Support running the same suite with different settings (thinking on/off, best-of-N, fallback enabled).

**Acceptance:** one command prints the results table for the suite, and a second run with different settings adds comparable rows.

---

# 6. Accuracy gate (owner decides)

The owner will set the pass-rate threshold before seeing eval results. A suggested starting point is at least 70% on easy single-file tasks. Do not assume, estimate, or quote any pass rate before the eval runner has measured it.

Possible outcomes, decided by the owner from the measured results:

- Threshold met with local models: continue.
- Met only with extra levers (thinking, best-of-N, fallback): continue and record the time cost.
- Not met even with all levers: switch the `main` role to an online model by editing `config.toml` only, keep everything else.

---

# 7. Out of scope for this build

Backend API, web UI, voice, subagents, design mode, online model providers (only the config-level switch is prepared), any network access by the agent, any change to files outside the project root.

When step 7 is confirmed complete, stop and report. The backend and frontend will be specified in a separate prompt.
