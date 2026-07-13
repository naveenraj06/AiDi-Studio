# AiDi Studio

Monorepo:

```
apps/web/            React + Vite frontend (see apps/web/README.md)
apps/api/             Fastify + TypeScript backend
supabase/migrations/  SQL schema + RPC functions applied to the Supabase project
```

## Backend (`apps/api`)

The backend runs entirely on **Supabase**: Supabase Auth for signup/login/sessions,
and Supabase's Postgres for data, queried over its auto-generated REST API
(PostgREST) via `@supabase/supabase-js` — no Prisma, no direct Postgres
connection string. Fastify owns CRUD for Projects, API Resources, Widgets,
Dashboards, Team, and Billing, and enforces project-role authorization
(`owner` > `editor` > `viewer`) in application code before every query.

### How auth works

- The frontend talks to Supabase directly (`@supabase/supabase-js`) for signup,
  login, logout, password reset, etc., and gets back a Supabase access token.
- That token is sent to this API as `Authorization: Bearer <token>` on every
  authenticated request.
- `src/plugins/supabaseAuth.ts` verifies it by calling Supabase's
  `GET /auth/v1/user` with the project's publishable key — no shared JWT secret
  needed on this server. A 200 response means the token is valid; the returned user's
  `id`/`email` become `request.userId`/`request.userEmail`.
- There's no local `users` table — `projects.owner_id` and
  `project_members.user_id` are plain `auth.users.id` UUIDs, with a real FK to
  `auth.users` (see `supabase/migrations/`).
- Team invites: `POST /projects/:id/team` creates a `project_members` row keyed
  by email with `user_id: null`. The next time that person authenticates (any
  request), the auth plugin auto-links their Supabase user id to any pending
  invite matching their email.

### How data access works

- `src/lib/supabase.ts` creates a Supabase client with the **secret key**,
  which bypasses Row Level Security — this API is the trusted backend
  and does its own authorization (`src/lib/authz.ts`) before every query, so
  RLS is enabled on every table as a deny-by-default backstop but has no
  permissive policies.
- Most routes are plain PostgREST calls (`supabase.from("widgets").select(...)`,
  `.insert(...)`, etc.).
- Two operations need real cross-table atomicity that a single PostgREST
  request can't express, so they're Postgres functions called via `.rpc(...)`:
  - `create_project` — inserts the project, the owner's `project_members` row,
    and its `billing` row together.
  - `replace_dashboard_tiles` — replaces a dashboard's tile layout (delete +
    reinsert) and bumps `updated_at` in one transaction.

### Setup

Project: `wpnurprzcqgirtbuqtmj` (`https://wpnurprzcqgirtbuqtmj.supabase.co`).

**1. Configure the API:**

```bash
cd apps/api
cp .env.example .env
```

Edit `apps/api/.env`:

```bash
SUPABASE_URL="https://wpnurprzcqgirtbuqtmj.supabase.co"
SUPABASE_PUBLISHABLE_KEY="sb_publishable_dIMTpZuPC6_eKH31jM9ISA_pTPnsRCZ"
SUPABASE_SECRET_KEY="sb_secret_..."   # Project Settings > API > secret key (not the legacy service_role JWT)
SUPABASE_DB_URL="postgresql://postgres.wpnurprzcqgirtbuqtmj:PASSWORD@aws-0-<region>.pooler.supabase.com:6543/postgres"
```

`SUPABASE_DB_URL` is the "Transaction pooler" connection string from Project
Settings > Database > Connection string, with your database password filled
in. It's only used by the setup script below, not by the running server.

**2. Apply the schema** (one-time, from a machine that can reach
`*.supabase.co` — this repo's own sandbox environment can't, see below):

```bash
npm run setup   # from the repo root
```

`npm run setup` (`scripts/setup-supabase.js`) reads `apps/api/.env` and
applies everything in `supabase/migrations/` via a plain Postgres connection
(`pg`, run through Node) using `SUPABASE_DB_URL` — no Supabase CLI, no login,
no browser step, no system packages beyond Node. It's idempotent: re-running
it is a no-op once the schema exists.

Run `npm run setup` once per environment before starting the dev or
production server for the first time, and again whenever
`supabase/migrations/` changes.

**3. Run it:**

```bash
npm install
npm run dev    # http://localhost:4000
```

Sign up / log in via Supabase (dashboard, `supabase-js`, or the REST
`/auth/v1/signup` and `/auth/v1/token?grant_type=password` endpoints) to get an
access token, then call this API with it as `Authorization: Bearer <token>`.

> This repo's own sandbox network policy blocks all outbound traffic to
> `*.supabase.co`/`*.supabase.com` (confirmed via direct HTTPS requests and
> the Supabase CLI itself), so the actual connection to your Supabase project
> hasn't been exercised from inside it. What *has* been verified for real: the
> setup script's full apply-and-idempotency logic against a real local
> Postgres (fresh apply succeeds, re-running is a correct no-op, a missing or
> wrong `SUPABASE_DB_URL` fails with a clear message) — since it's a plain SQL
> flow over a Postgres connection, this should behave identically against
> Supabase's Postgres. Also verified locally: the server boots and correctly rejects
> unauthenticated/invalid-token requests. Not verified: an actual authenticated
> request reaching your real Supabase project, which needs to happen from your
> machine or CI.

### Routes

- `GET /auth/me` — echoes the verified Supabase user (id/email/name)
- `GET|POST /projects`, `GET|PATCH|DELETE /projects/:id`
- `GET|POST /projects/:projectId/resources`, `PATCH|DELETE /projects/:projectId/resources/:id`, `POST .../resources/:id/test-connection`, `GET .../resources/:id/data` (proxied live response, for widgets), `POST .../resources/:id/suggest-widget` (AI widget-type + field-mapping suggestion; see below)
- `GET|POST /projects/:projectId/widgets`, `PATCH|DELETE /projects/:projectId/widgets/:id`, `POST .../widgets/:id/duplicate` (instantiate a template)
- `GET|POST /projects/:projectId/dashboards`, `GET|PATCH|DELETE /projects/:projectId/dashboards/:id`, `PUT .../dashboards/:id/tiles`
- `GET /public/dashboards/:slug` (published dashboards; `?password=` if share-protected)
- `GET|POST /projects/:projectId/team`, `PATCH|DELETE /projects/:projectId/team/:id`
- `GET|PATCH /projects/:projectId/billing`

### AI widget suggestions

`POST /projects/:projectId/resources/:id/suggest-widget` fetches a live
sample of the resource and asks an LLM which widget type and field mapping
fit it best (`apps/api/src/lib/aiSuggest.ts`). It's backed by
[Groq](https://console.groq.com/keys) — a free-tier, OpenAI-compatible API
that serves open-source models (Llama 3.3 by default), so there's no
self-hosted inference server to run. Set `GROQ_API_KEY` (and optionally
`GROQ_MODEL`) in `apps/api/.env` to enable it.

Without a key — or if the call errors, times out, or returns a mapping that
doesn't actually cover what the chosen widget type needs to render — it falls
back automatically to a deterministic heuristic (`lib/heuristicSuggest.ts`)
that inspects the real sample's field names and types (not just the
resource's name). The response always includes `usedAi: boolean` so the
builder UI can honestly label which path produced the suggestion.

### Out of scope for this milestone

No Stripe integration (billing endpoints just persist plan/seat records), no
TOTP/2FA.

## Frontend (`apps/web`)

See `apps/web/README.md`.
