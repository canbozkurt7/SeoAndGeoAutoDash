create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type app_role as enum ('owner', 'editor');
  end if;
  if not exists (select 1 from pg_type where typname = 'llm_engine') then
    create type llm_engine as enum ('chatgpt', 'perplexity', 'gemini');
  end if;
  if not exists (select 1 from pg_type where typname = 'alert_severity') then
    create type alert_severity as enum ('info', 'medium', 'high', 'critical');
  end if;
  if not exists (select 1 from pg_type where typname = 'alert_status') then
    create type alert_status as enum ('open', 'acknowledged', 'resolved');
  end if;
  if not exists (select 1 from pg_type where typname = 'pipeline_status') then
    create type pipeline_status as enum ('success', 'partial_failure', 'failed');
  end if;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role app_role not null default 'editor',
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role) values (new.id, 'owner')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create table if not exists public.site (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  domain text not null,
  url text not null,
  seo_drop_threshold numeric not null default 8,
  geo_drop_threshold numeric not null default 10,
  spike_threshold numeric not null default 12,
  created_at timestamptz not null default now()
);

create table if not exists public.site_member (
  site_id uuid not null references public.site(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role app_role not null default 'editor',
  created_at timestamptz not null default now(),
  primary key (site_id, user_id)
);

create or replace function public.bootstrap_default_site_for_profile()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  new_site_id uuid;
begin
  insert into public.site (
    owner_user_id,
    name,
    domain,
    url
  ) values (
    new.id,
    'My Site',
    'example.com',
    'https://example.com'
  ) returning id into new_site_id;

  insert into public.site_member (site_id, user_id, role)
  values (new_site_id, new.id, 'owner')
  on conflict (site_id, user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_profile_created on public.profiles;
create trigger on_profile_created
after insert on public.profiles
for each row execute procedure public.bootstrap_default_site_for_profile();

create table if not exists public.integration_account (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.site(id) on delete cascade,
  provider text not null,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, provider)
);

create table if not exists public.tracked_prompt (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.site(id) on delete cascade,
  prompt_text text not null,
  intent text not null default 'informational',
  priority int not null default 3,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.prompt_batch (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.site(id) on delete cascade,
  run_date date not null,
  status text not null default 'queued',
  created_at timestamptz not null default now()
);

create table if not exists public.seo_snapshot_daily (
  site_id uuid not null references public.site(id) on delete cascade,
  date date not null,
  clicks int not null,
  impressions int not null,
  ctr numeric not null,
  avg_position numeric not null,
  sessions int not null,
  conversions int not null,
  created_at timestamptz not null default now(),
  primary key (site_id, date)
);

create table if not exists public.geo_observation (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.site(id) on delete cascade,
  prompt_id uuid not null references public.tracked_prompt(id) on delete cascade,
  engine llm_engine not null,
  cited_domains text[] not null default '{}',
  mention_domains text[] not null default '{}',
  response_id text not null,
  run_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.geo_score_daily (
  site_id uuid not null references public.site(id) on delete cascade,
  date date not null,
  seo_score numeric not null,
  geo_citation_score numeric not null,
  seo_delta numeric not null default 0,
  geo_delta numeric not null default 0,
  alert_flags text[] not null default '{}',
  created_at timestamptz not null default now(),
  primary key (site_id, date)
);

create table if not exists public.alert_event (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.site(id) on delete cascade,
  event_date date not null,
  event_type text not null,
  severity alert_severity not null default 'medium',
  status alert_status not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists public.email_subscriber (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.site(id) on delete cascade,
  email text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (site_id, email)
);

create table if not exists public.email_queue (
  id uuid primary key default gen_random_uuid(),
  to_address text not null,
  subject text not null,
  body text not null,
  status text not null default 'queued',
  retries int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.pipeline_run_log (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.site(id) on delete cascade,
  run_date date not null,
  status pipeline_status not null,
  failed_engines llm_engine[] not null default '{}',
  message text not null,
  created_at timestamptz not null default now()
);

create or replace view public.prompt_change_view as
with latest as (
  select
    go.site_id,
    go.prompt_id,
    tp.prompt_text,
    date(go.run_at) as d,
    avg(case when exists (
      select 1
      from unnest(go.cited_domains) cd
      where cd like '%' || s.domain || '%'
    ) then 1 else 0 end)::numeric * 100 as visibility
  from public.geo_observation go
  join public.tracked_prompt tp on tp.id = go.prompt_id
  join public.site s on s.id = go.site_id
  group by 1,2,3,4
),
ranked as (
  select
    site_id,
    prompt_id,
    prompt_text,
    d,
    visibility,
    lag(visibility) over (partition by site_id, prompt_id order by d asc) as prev_visibility
  from latest
)
select
  site_id,
  prompt_id,
  prompt_text,
  coalesce(visibility - prev_visibility, 0) as delta
from ranked
where prev_visibility is not null;

alter table public.profiles enable row level security;
alter table public.site enable row level security;
alter table public.site_member enable row level security;
alter table public.integration_account enable row level security;
alter table public.tracked_prompt enable row level security;
alter table public.prompt_batch enable row level security;
alter table public.seo_snapshot_daily enable row level security;
alter table public.geo_observation enable row level security;
alter table public.geo_score_daily enable row level security;
alter table public.alert_event enable row level security;
alter table public.email_subscriber enable row level security;
alter table public.email_queue enable row level security;
alter table public.pipeline_run_log enable row level security;

create or replace function public.has_site_access(p_site_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.site_member sm
    where sm.site_id = p_site_id and sm.user_id = auth.uid()
  );
$$;

drop policy if exists "profiles_read_own" on public.profiles;
create policy "profiles_read_own" on public.profiles
for select using (id = auth.uid());

drop policy if exists "site_access_read" on public.site;
create policy "site_access_read" on public.site
for select using (public.has_site_access(id));

drop policy if exists "site_member_access_read" on public.site_member;
create policy "site_member_access_read" on public.site_member
for select using (user_id = auth.uid() or public.has_site_access(site_id));

drop policy if exists "site_scoped_read" on public.integration_account;
create policy "site_scoped_read" on public.integration_account
for select using (public.has_site_access(site_id));

drop policy if exists "site_scoped_read_prompt" on public.tracked_prompt;
create policy "site_scoped_read_prompt" on public.tracked_prompt
for select using (public.has_site_access(site_id));

drop policy if exists "site_scoped_read_batch" on public.prompt_batch;
create policy "site_scoped_read_batch" on public.prompt_batch
for select using (public.has_site_access(site_id));

drop policy if exists "site_scoped_read_snapshot" on public.seo_snapshot_daily;
create policy "site_scoped_read_snapshot" on public.seo_snapshot_daily
for select using (public.has_site_access(site_id));

drop policy if exists "site_scoped_read_observation" on public.geo_observation;
create policy "site_scoped_read_observation" on public.geo_observation
for select using (public.has_site_access(site_id));

drop policy if exists "site_scoped_read_geo_score" on public.geo_score_daily;
create policy "site_scoped_read_geo_score" on public.geo_score_daily
for select using (public.has_site_access(site_id));

drop policy if exists "site_scoped_read_alert" on public.alert_event;
create policy "site_scoped_read_alert" on public.alert_event
for select using (public.has_site_access(site_id));

drop policy if exists "site_scoped_read_subscriber" on public.email_subscriber;
create policy "site_scoped_read_subscriber" on public.email_subscriber
for select using (public.has_site_access(site_id));

drop policy if exists "site_scoped_read_run_log" on public.pipeline_run_log;
create policy "site_scoped_read_run_log" on public.pipeline_run_log
for select using (public.has_site_access(site_id));
