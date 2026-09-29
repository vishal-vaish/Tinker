# Tinker Project & Agent Rules

## 1. Component Architecture & Directory Rules
- **Mock Data**: ALL mock data MUST be located under a dedicated mocked data file (`frontend-mock/lib/mock-data.ts`). Never inline mock arrays, statistics, testimonials, or simulated backend data directly inside UI components or page files.
- **Route-Specific Components**: Any component that belongs exclusively to a single page or route MUST be organized under a `_components/` directory inside that route (e.g., `app/_components/` for the landing page sections).
- **Global Components**: All shared cross-cutting application components MUST be placed under `components/global/` (e.g., `components/global/Header.tsx`, `components/global/Footer.tsx`).
- **shadcn/ui Component Usage**: All UI primitives MUST use the installed shadcn/ui components in `components/ui/` (`Button`, `Card`, `Badge`, `Input`, `Separator`, `Accordion`, etc.). Never reinvent native buttons or inputs when a shadcn/ui primitive exists.

## 2. Production Realism Standards
- **Zero Toy / Wireframe Artifacts**: Strictly NO "Screen 1 / Screen 2" demo bars, dummy wireframe headers, or quick login cheat bypasses.
- **Authentic Production Quality**: Every screen must look, feel, and function like an enterprise production SaaS platform (e.g., Linear, Vercel, Supabase, Cursor).
- **Pacing**: Develop one screen at a time with full craftsmanship.

## 3. Design System & Tokens
- Strictly follow the Tailwind v4 OKLCH token configuration defined in `app/globals.css`.
