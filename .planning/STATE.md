# State — Mini Coding Agent

## Current Phase
Universal Multi-Framework & Polyglot Stack Support (Phases 8 & 9)

## Current Status
🟢 BUILT & VERIFIED — Multi-stack detection and startup validation complete. 22/22 unit tests passing. 8 benchmark tasks available (Python, HTML, React, Vite, Next.js).

## Decisions Log
| Date | Decision | Rationale |
|---|---|---|
| 2026-09-29 | `gemma4:latest` as main model | Largest available (9.6 GB), best capability |
| 2026-09-29 | `qwen3.5:9b` as fallback model | Strong coding model, good safety net |
| 2026-09-29 | Agent core + CLI scope only | Per AGENT_BUILD_PROMPT.md — backend/UI come later |
| 2026-09-29 | 5 sample projects | Cover: off-by-one, missing function, wrong import, small feature, cross-file bug |
| 2026-09-29 | Multi-framework startup check | Early validation fails fast if requested stack doesn't match project markers |
| 2026-09-29 | Polyglot stack resolution | Merges allowed commands and test file patterns for mixed apps (e.g. Python + Vite) |

## Blockers
None

## Notes
- Models available on Ollama: llama3.1:8b, qwen3.5:9b, gemma4:latest, gemma4:e4b
- Project root: `e:\vishal\Tinker\agentic\`
