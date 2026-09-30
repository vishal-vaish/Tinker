# Tinker Project & Agent Rules

## 1. Component Architecture & Directory Rules
- **Mock Data**: ALL mock data MUST be located under a dedicated mocked data file (`frontend-mock/lib/mock-data.ts`). Never inline mock arrays, statistics, testimonials, or simulated backend data directly inside UI components or page files.
- **Validation Schemas (Zod)**: ALL form validation schemas MUST be defined in a centralized schema file (`lib/schemas.ts`). Never define inline Zod schemas or ad-hoc validation logic inside UI components, forms, or page files. Always export TypeScript types using `z.infer<typeof schema>`.
- **Centralized Type Definitions (`lib/types.ts`)**: ALL TypeScript types and interfaces for API requests, API responses, and domain entities MUST be organized exclusively in `lib/types.ts`. Never declare ad-hoc request/response types or domain entity interfaces inline within UI components, action files, or page files. Shared models, payloads, and domain objects must always be imported from `@/lib/types`.
- **Form Directory & Architecture**: ALL form components MUST be organized exclusively under the `components/forms/` directory.
  - Distinct form flows MUST be separated into individual files (e.g., `components/forms/LoginForm.tsx` exclusively for Sign In, and `components/forms/SignUpForm.tsx` exclusively for Sign Up). Never bundle multiple distinct authentication flows or opposing form modes into a single monolithic file.
  - Never inline raw forms or multi-field input logic directly inside page views or route layouts.
- **Provider Directory & Architecture**: ALL application provider and context components (e.g., `AgentationProvider`, theme providers, auth providers, context providers) MUST be organized exclusively under the top-level `providers/` directory as a direct child of `frontend-mock` (`frontend-mock/providers/` or `@/providers/`). Strictly NEVER place providers inside `components/` (such as `components/global/` or `components/providers/`) or inside individual page files.
- **Action & API Directory Architecture (`action/`)**: ALL API calls, remote backend requests, server actions, and mutation endpoints MUST be organized exclusively under the top-level `action/` directory as a direct child of `frontend-mock` (`frontend-mock/action/` or `@/action/`). Never invoke raw `fetch()` or inline API call logic directly inside UI components, forms, or page files. Forms and UI components must always import and call centralized action functions (e.g., `loginEndpoint`, `registerEndpoint`).
- **Form Validation & State Management**: ALL forms MUST use `react-hook-form` with `zodResolver` imported from `@hookform/resolvers/zod` referencing the central schema from `@/lib/schemas`.
- **Form Input Components (`CustomInput` & `Field` Primitives)**:
  - Form inputs MUST utilize `CustomInput` from `@/components/global/CustomInput` which integrates `react-hook-form`'s `<Controller>`, shadcn `<Field>`, `<FieldLabel>`, `<FieldDescription>`, and `<FieldError>`.
  - Every input MUST be paired with an associated `<FieldLabel>` matching the input `id`/`name`. Never render unassociated native `<label>` tags or naked `<input>` elements.
- **shadcn/ui Component Usage & Zero Redundant `className` Overrides**:
  - All UI primitives MUST use the installed shadcn/ui components in `components/ui/` (`Button`, `Card`, `Badge`, `Input`, `Field`, `Separator`, `Accordion`, etc.). Never reinvent native buttons or inputs when a shadcn/ui primitive exists.
  - **No Manual `className` Overwrites on UI Components**: Rely strictly on the component's built-in variants, sizes, and tokens (e.g., `<Button variant="outline" size="lg">`). Strictly DO NOT write manual, repetitive inline `className` utility overrides on component tags (such as hardcoded colors, borders, custom padding, or custom heights) unless strictly required for macro page layout (e.g., `w-full`, `mt-4`, `grid`). Manually overwriting CSS on every UI tag defeats the purpose of having a component library and design system.
- **Route-Specific Components**: Any component that belongs exclusively to a single page or route MUST be organized under a `_components/` directory inside that route (e.g., `app/_components/` for landing page sections, `app/login/_components/LoginView.tsx` for login container).
- **Global Components**: All shared cross-cutting application components MUST be placed under `components/global/` (e.g., `components/global/Logo.tsx`, `components/global/CustomInput.tsx`, `components/global/ShinyText.tsx`).

## 2. Production Realism Standards
- **Zero Toy / Wireframe Artifacts**: Strictly NO "Screen 1 / Screen 2" demo bars, dummy wireframe headers, or quick login cheat bypasses.
- **Authentic Production Quality**: Every screen must look, feel, and function like an enterprise production SaaS platform (e.g., Linear, Vercel, Supabase, Cursor).
- **Pacing**: Develop one screen at a time with full craftsmanship.

## 3. Design System & Tokens
- Strictly follow the Tailwind v4 OKLCH token configuration defined in `app/globals.css`.
