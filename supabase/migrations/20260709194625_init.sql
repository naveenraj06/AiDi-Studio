-- AiDi Studio app schema. auth.users is managed by Supabase Auth already.

create type plan as enum ('free', 'pro', 'team', 'enterprise');
create type project_role as enum ('owner', 'editor', 'viewer');
create type auth_type as enum ('bearer', 'api_key', 'oauth', 'none');
create type resource_status as enum ('healthy', 'error');
create type imported_from as enum ('postman', 'openapi', 'curl', 'manual');
create type widget_type as enum ('line', 'bar', 'stat', 'table', 'donut', 'map');
create type dashboard_status as enum ('draft', 'published');
create type invoice_status as enum ('paid', 'failed');
create type billing_status as enum ('active', 'past_due', 'canceled', 'trialing');

create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text not null default 'box',
  color text not null default '#7C5CFC',
  plan plan not null default 'free',
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index projects_owner_id_idx on projects(owner_id);

create table project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null,
  role project_role not null default 'viewer',
  invited_at timestamptz not null default now(),
  unique (project_id, email)
);
create index project_members_user_id_idx on project_members(user_id);

create table api_resources (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  url text not null,
  method text not null default 'GET',
  auth_type auth_type not null default 'none',
  auth_credential text,
  status resource_status not null default 'healthy',
  last_tested_at timestamptz,
  last_test_latency_ms integer,
  imported_from imported_from not null default 'manual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index api_resources_project_id_idx on api_resources(project_id);

create table widgets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  type widget_type not null,
  is_template boolean not null default false,
  resource_id uuid references api_resources(id) on delete set null,
  mapping jsonb,
  fine_tune jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index widgets_project_id_idx on widgets(project_id);
create index widgets_resource_id_idx on widgets(resource_id);

create table dashboards (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  slug text not null unique,
  status dashboard_status not null default 'draft',
  share_password_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index dashboards_project_id_idx on dashboards(project_id);

create table dashboard_tiles (
  id uuid primary key default gen_random_uuid(),
  dashboard_id uuid not null references dashboards(id) on delete cascade,
  widget_id uuid not null references widgets(id) on delete cascade,
  position integer not null default 0,
  col_span integer not null default 1,
  row_span integer not null default 1
);
create index dashboard_tiles_dashboard_id_idx on dashboard_tiles(dashboard_id);
create index dashboard_tiles_widget_id_idx on dashboard_tiles(widget_id);

create table billing (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references projects(id) on delete cascade,
  plan plan not null default 'free',
  status billing_status not null default 'active',
  seats integer not null default 1,
  price_per_seat integer not null default 0,
  current_period_end timestamptz,
  card_brand text,
  card_last4 text,
  card_exp text
);

create table invoices (
  id uuid primary key default gen_random_uuid(),
  billing_id uuid not null references billing(id) on delete cascade,
  date timestamptz not null,
  amount integer not null,
  status invoice_status not null
);
create index invoices_billing_id_idx on invoices(billing_id);

-- The Fastify API is the only client; it connects with the service_role key,
-- which bypasses RLS by design. RLS is still enabled with no policies as a
-- deny-by-default backstop for the anon/authenticated (PostgREST) roles.
alter table projects enable row level security;
alter table project_members enable row level security;
alter table api_resources enable row level security;
alter table widgets enable row level security;
alter table dashboards enable row level security;
alter table dashboard_tiles enable row level security;
alter table billing enable row level security;
alter table invoices enable row level security;

-- Atomic multi-table writes that PostgREST can't express as a single request.

create or replace function create_project(
  p_name text,
  p_icon text,
  p_color text,
  p_owner_id uuid,
  p_owner_name text,
  p_owner_email text
) returns projects
language plpgsql
security definer
set search_path = public
as $$
declare
  v_project projects;
begin
  insert into projects (name, icon, color, owner_id)
  values (p_name, p_icon, p_color, p_owner_id)
  returning * into v_project;

  insert into project_members (project_id, user_id, name, email, role)
  values (v_project.id, p_owner_id, p_owner_name, p_owner_email, 'owner');

  insert into billing (project_id) values (v_project.id);

  return v_project;
end;
$$;

create or replace function replace_dashboard_tiles(
  p_dashboard_id uuid,
  p_tiles jsonb
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from dashboard_tiles where dashboard_id = p_dashboard_id;

  insert into dashboard_tiles (dashboard_id, widget_id, position, col_span, row_span)
  select
    p_dashboard_id,
    (t ->> 'widgetId')::uuid,
    ord - 1,
    (t ->> 'colSpan')::int,
    (t ->> 'rowSpan')::int
  from jsonb_array_elements(p_tiles) with ordinality as arr(t, ord);

  update dashboards set updated_at = now() where id = p_dashboard_id;
end;
$$;
