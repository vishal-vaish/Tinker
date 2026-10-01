# Frontend Agent Rules & Standards

> 🔒 **STRICT CODE & DOCS FREEZE (`docs/` and `AGENTS.md`)**:
> **STRICTLY NO DIRECT MODIFICATIONS — NOT EVEN SLIGHT OR MINOR ONES — MAY BE MADE TO ANY FILE INSIDE `docs/` OR TO THIS `AGENTS.md` FILE.**
> If any frontend task, feature, or flow requires modifying anything inside `docs/` or updating agent rules:
> 1. **STOP**: Do NOT touch the file.
> 2. **EXPLAIN**: Clearly state to the user **what** needs to be changed and **why** it is necessary.
> 3. **CONFIRM**: Wait for the user's explicit confirmation before writing or editing a single line.
> Zero unconfirmed edits to `docs/` or `AGENTS.md`. This rule is absolute and strictly enforced.

---

> **Canonical Document**: See [**`docs/ui/UI_RULES.md`**](../docs/ui/UI_RULES.md) for full detailed specifications.
> **Database Types**: Must strictly match [**`docs/DATABASE_SCHEMA.md`**](../docs/DATABASE_SCHEMA.md) and [`lib/types.ts`](./lib/types.ts).

## Essential Rules for Frontend Changes

1. **Centralized Schemas & Types**:
   - Validation schemas strictly in `lib/schemas.ts` using Zod.
   - Domain models strictly in `lib/types.ts` imported from `@/lib/types`.
   - Mock data strictly in `lib/mock-data.ts`.
2. **Directory Placement**:
   - Forms strictly under `components/forms/` (e.g. `LoginForm.tsx` vs `SignUpForm.tsx`).
   - Providers strictly under top-level `providers/`. Never place providers in `components/`.
   - API & mutation logic strictly under top-level `action/`. Never inline raw `fetch()` in components.
   - Route-specific components under `app/<route>/_components/`.
   - Global components under `components/global/`.
3. **Inputs & UI Primitives**:
   - Always use `CustomInput` from `@/components/global/CustomInput`.
   - Every input must have an associated `<FieldLabel>`.
   - Use shadcn/ui variants (`variant`, `size`). Strictly no manual, repetitive utility overrides on component tags.
4. **Color Tokens (No Primary Bleed)**:
   - Pro Tier: Amber/Orange gradient (`from-amber-500 to-orange-500`).
   - Free Tier: Neutral outline (`variant="outline" text-muted-foreground`).
   - Active/Success: Emerald (`emerald-500`).
   - Highlights: Rose/Fuchsia (`rose-500`).
