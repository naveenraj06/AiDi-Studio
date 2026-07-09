# AiDi Studio

Monorepo with two workspaces:

```
apps/web/   React + Vite frontend (see apps/web/README.md)
apps/api/   Fastify + TypeScript + Postgres backend
```

## Backend (`apps/api`)

Real auth (JWT + DB-backed sessions, bcrypt) and CRUD for Projects, API Resources,
Widgets, Dashboards, Team, and Billing, backed by Postgres via Prisma.

### Setup

```bash
cd apps/api
cp .env.example .env   # point DATABASE_URL at your Postgres instance
npm install
npm run prisma:migrate  # applies schema, generates Prisma client
npm run prisma:seed     # optional: creates demo@aidistudio.dev / password123
npm run dev              # http://localhost:4000
```

### Auth flow

There's no email provider wired up yet, so verification and password-reset links
are logged to the server console and — outside `NODE_ENV=production` — also
returned directly in the API response (`verification_token` / `reset_token`), so
you can drive the flow without SMTP:

1. `POST /auth/signup` → creates an unverified user, returns a verification token
2. `POST /auth/verify-email { token }` → verifies the user, returns a session `access_token`
3. `POST /auth/login { email, password }` → requires a verified email, returns `access_token`
4. All authenticated routes take `Authorization: Bearer <access_token>`

### Routes

- `POST /auth/signup|login|logout|logout-all|verify-email|resend-verification|forgot-password|reset-password`, `GET /auth/me`
- `GET|POST /projects`, `GET|PATCH|DELETE /projects/:id`
- `GET|POST /projects/:projectId/resources`, `PATCH|DELETE /projects/:projectId/resources/:id`, `POST .../resources/:id/test-connection`
- `GET|POST /projects/:projectId/widgets`, `PATCH|DELETE /projects/:projectId/widgets/:id`
- `GET|POST /projects/:projectId/dashboards`, `GET|PATCH|DELETE /projects/:projectId/dashboards/:id`, `PUT .../dashboards/:id/tiles`
- `GET /public/dashboards/:slug` (published dashboards; `?password=` if share-protected)
- `GET|POST /projects/:projectId/team`, `PATCH|DELETE /projects/:projectId/team/:id`
- `GET|PATCH /projects/:projectId/billing`

Authorization is role-based per project (`owner` > `editor` > `viewer`), derived
from project ownership or `ProjectMember` rows.

### Out of scope for this milestone

No Stripe integration (billing endpoints just persist plan/seat records), no real
email delivery, no TOTP/2FA verification, no LLM-backed widget suggestions — the
frontend's `suggestFor.ts` heuristic isn't reproduced server-side. `apps/web/src/context/AppContext.tsx`
is still on in-memory mock data; wiring it to this API is the next step.

## Frontend (`apps/web`)

See `apps/web/README.md`.
