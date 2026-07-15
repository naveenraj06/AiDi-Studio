-- Unifies the plan model on free/pro/org (dropping the unused team/enterprise
-- values so the marketing pricing page and the billing API agree on one
-- vocabulary), and adds the two new entities needed to back real pricing-page
-- features: orgs (business-email-gated collaboration) and api_keys (the SDK's
-- live-data auth path).

create type plan_new as enum ('free', 'pro', 'org');

alter table projects alter column plan drop default;
alter table projects alter column plan type plan_new using (
  case plan::text when 'team' then 'org' when 'enterprise' then 'org' else plan::text end
)::plan_new;
alter table projects alter column plan set default 'free'::plan_new;

alter table billing alter column plan drop default;
alter table billing alter column plan type plan_new using (
  case plan::text when 'team' then 'org' when 'enterprise' then 'org' else plan::text end
)::plan_new;
alter table billing alter column plan set default 'free'::plan_new;

drop type plan;
alter type plan_new rename to plan;

create table orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  domain text not null unique,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table projects add column org_id uuid references orgs(id) on delete set null;

create table api_keys (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  key_prefix text not null,
  key_hash text not null,
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz
);
create index api_keys_project_id_idx on api_keys(project_id);

alter table orgs enable row level security;
alter table api_keys enable row level security;
