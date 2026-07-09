# AiDi Studio — frontend prototype

An interactive React implementation of the AiDi Studio UI, built from the `Master spec requirements`
Claude Design bundle (see `../README.md`, `../chats/`, `../project/*.dc.html`, `../project/uploads/MASTER-SPEC.md`).

Stack: Vite + React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui (Radix primitives) + react-router-dom,
matching the reference architecture described in MASTER-SPEC.md §7.

## Running

```bash
npm install
npm run dev
```

Sign up (any name/email/password ≥ 8 chars) or use the "Simulate: click verification link" button on the
verify-email screen to get straight into the app. All data is in-memory mock state seeded from the design
bundle's sample dataset (3 projects, API resources, widgets, dashboards, team members, billing) — nothing
persists to a backend, since none exists yet.

## What's implemented

Every screen from the design bundle, fully interactive with mock data:

- Landing, Signup, Login, Verify email, Forgot/Reset password
- Projects list + create
- Dashboards list + create
- Dashboard canvas: drag-to-reorder, width/height resize, add/remove widgets, publish modal
- API Resources: table, test-connection simulation, import (Manual/Postman/OpenAPI/cURL tabs)
- Widgets library (regular + templates)
- 4-step widget builder: pick resource → AI suggestion (deterministic rule-based, mirrors the AI
  Integration Spec's fallback logic in MASTER-SPEC.md §9) → fine-tune → preview & save
- Team (per-project members, invite, role change, remove)
- Account settings (profile, password, 2FA setup + backup codes, session list)
- Billing (plans, payment method, invoice history)
- Embed & SDK reference
- Public dashboard view, including password-unlock and not-found states

## What's out of scope

Per MASTER-SPEC.md §19 and the frontend-only build scope agreed with the user: no real backend, auth
server, Postgres, Stripe, or LLM orchestration. `src/context/AppContext.tsx` is the seam where real API
calls would replace the in-memory mock state.

## Structure

```
src/
  components/ui/            shadcn/ui primitives (button, card, input, select, switch, dialog, ...)
  components/widgets/       WidgetRenderer (mini chart preview) + type metadata
  components/widget-builder/  Step1-4 components + AI suggestion heuristic
  components/dashboard-canvas/  tile card, add-widget dialog, publish dialog
  components/resources/     import-resource dialog
  context/AppContext.tsx    session/auth + all mock data + mutator actions + toast
  data/mockData.ts          seed dataset
  layouts/AppShell.tsx      sidebar + outlet
  pages/                    one file per route
  routes/guards.tsx         RequireAuth / PublicOnly
```
