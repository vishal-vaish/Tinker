# Mini Coding Agent

## Vision
A local-first coding agent that takes a coding task, explores a project folder, edits files, runs tests, reads the failures, and retries — all inside a sandbox with a permission system. Built for **learning how agentic systems work** with accuracy as the top priority.

## Type
CLI Application → Agent Core (backend + frontend come later in separate prompts)

## Tech Stack
- **Language:** Python (standard library + one HTTP client)
- **Model Runtime:** Ollama (local HTTP API)
- **Models:** `gemma4:latest` (main), `qwen3.5:9b` (fallback)
- **Storage:** SQLite + per-run trace files (JSONL)
- **Test Framework:** Python `unittest` (standard library)
- **No frameworks, no agent libraries, no MCP**

## Architecture
```
CLI (thin adapter) → Event contract → Agent Loop → Tools + Safety → Model Client → Ollama
```

- **Event-driven core:** agent communicates only through events
- **Model-agnostic:** one interface, roles in config, no model names in code
- **Deterministic before LLM:** code decides path checks, allowlists, budgets, test pass/fail
- **Objective feedback:** test results/exit codes decide success, never the model's claim

## Key Constraints
- Build ONLY the agent core + CLI. No backend, no web UI, no voice, no subagents
- Do NOT probe hardware/GPU. Assume Ollama reachable at default local address
- No dependencies beyond stdlib + one HTTP client without owner approval
- One Python process. No services, no message queues
- Speed is not a goal. Slow is acceptable. Accuracy is everything
- Build in numbered steps, each with acceptance check + owner confirmation gate

## Project Root
`e:\vishal\Tinker\agentic\`

## Source Spec
- [AGENT_BUILD_PROMPT.md](file:///e:/vishal/Tinker/AGENT_BUILD_PROMPT.md) — build instructions
- [ARCHITECTURE_PROMPT.md](file:///e:/vishal/Tinker/ARCHITECTURE_PROMPT.md) — full system architecture
