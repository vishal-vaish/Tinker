# Tinker Platform — Master Agent Index & Guardrails

> 🔒 **STRICT FREEZE ON `docs/` AND `AGENTS.md`**:
> **STRICTLY NO DIRECT MODIFICATIONS — NOT EVEN SLIGHT OR MINOR ONES — MAY BE MADE TO ANY FILE INSIDE `docs/` OR TO ANY `AGENTS.md` FILE.**
> - Modifying code inside `agentic/` (e.g. `main.py`, `server.py`, `agent/`, `eval/`) and `frontend-mock/` is allowed.
> - But if a task or flow requires modifying anything inside **`docs/`** or editing **`AGENTS.md`**:
>   1. **STOP**: Do NOT touch the file.
>   2. **EXPLAIN**: Clearly state to the user **what** needs to be changed and **why** it is necessary.
>   3. **CONFIRM**: Wait for the user's explicit confirmation before writing or editing a single line.
> Zero unconfirmed edits to `docs/` or `AGENTS.md`. This rule is absolute and strictly enforced.

---

## 1. Domain Governance Directory

| Domain | Target Files / Directories | Canonical Rule Document | Core Mandate |
|---|---|---|---|
| 🎨 **Frontend & UI** | `frontend-mock/`, UI components, forms, pages | [**`docs/ui/UI_RULES.md`**](file:///e:/vishal/Tinker/docs/ui/UI_RULES.md) | Centralized schemas/types, shadcn primitives, zero manual className overrides, OKLCH tokens, no toy artifacts. |
| 🏗️ **Architecture & Tiers** | `main.py`, `server.py`, API endpoints, event contracts | [**`docs/ARCHITECTURE_PROMPT.md`**](file:///e:/vishal/Tinker/docs/ARCHITECTURE_PROMPT.md) | 3-tier decoupling (UI ↔ Backend ↔ Agent), event-driven streaming contract, deterministic code before LLM. |
| 🗄️ **Database & Models** | PostgreSQL migrations, Pydantic schemas, `lib/types.ts` | [**`docs/DATABASE_SCHEMA.md`**](file:///e:/vishal/Tinker/docs/DATABASE_SCHEMA.md) | Exactly 8 canonical tables, strict enum definitions, `snake_case` in DB vs `camelCase` in TS, no schema drift. |
| 🤖 **Agentic Engine** | `agentic/agent/`, tools, safety jail, context manager | `agentic/agent/` & `config.toml` | `PathJail` confinement, command allowlists, test file protection, 8k context compression, model failover. |
| 📁 **User Storage** | `sandboxes/` (`projects/`, `drafts/`, `runs/`) | `docs/DATABASE_SCHEMA.md` (Sec 7) | Isolated project repos, lightweight draft canvases, scoped run traces (`runs/projects/<id>/`). |

---

## 2. Universal Non-Negotiable Invariants

Regardless of which domain you are touching, these principles apply across the entire repository:

1. **Strict Freeze on `docs/` and `AGENTS.md`**:
   - Zero edits permitted inside `docs/` or to any `AGENTS.md` rule files without prior user notification and explicit confirmation.
   - Code inside `agentic/` and `frontend-mock/` can be modified normally.
   - Always present **what** needs to be changed and **why**, then wait for explicit confirmation before touching any document in `docs/` or editing `AGENTS.md`.
2. **Check the Domain File First**:
   - Editing forms, UI components, or styles? Read [**`docs/ui/UI_RULES.md`**](file:///e:/vishal/Tinker/docs/ui/UI_RULES.md).
   - Editing API contracts, backend events, or tier boundaries? Read [**`docs/ARCHITECTURE_PROMPT.md`**](file:///e:/vishal/Tinker/docs/ARCHITECTURE_PROMPT.md).
   - Adding/modifying fields, types, or database tables? Read [**`docs/DATABASE_SCHEMA.md`**](file:///e:/vishal/Tinker/docs/DATABASE_SCHEMA.md).
3. **Zero Schema Drift**:
   - Never declare ad-hoc types or inline interfaces. Frontend types in `frontend-mock/lib/types.ts`, Backend models, and database columns MUST match `docs/DATABASE_SCHEMA.md` 1:1.
4. **Single-Stack Exclusivity**:
   - Every project/draft executes strictly ONE framework (`nextjs`, `vite`, `fastify`, `remix`, or `python`). Never mix multiple frameworks in a single project directory.
5. **Deterministic Code Outranks the LLM**:
   - Path checking (`PathJail`), command allowlisting, context budget limits, and test results are enforced by deterministic Python/TypeScript code, never left to the model's discretion.
6. **Authentic Production Realism**:
   - Strictly NO toy wireframe bars, dummy bypass headers, or fake UI shortcuts. Every screen and feature must feel like an enterprise developer tool (Linear, Vercel, Supabase).
7. **Test File Protection**:
   - Test files are read-only by default. The agent is never permitted to modify tests to fake a passing run. Success is solely judged by clean, passing verification commands.
