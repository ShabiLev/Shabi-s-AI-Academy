-- Version 1.3 user-data foundation. Review in a non-production Supabase project before applying.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null default '', last_name text not null default '', display_name text not null default '',
  preferred_language text not null default 'he' check (preferred_language in ('he','en')),
  experience_mode text not null default 'beginner' check (experience_mode in ('beginner','advanced')),
  experience_level text not null default 'beginner', main_goal text not null default '', interests text[] not null default '{}',
  onboarding_completed boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.user_preferences (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, content jsonb not null default '{}', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), schema_version integer not null default 1);
create table if not exists public.user_progress (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, lesson_id text not null, content jsonb not null default '{}', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), schema_version integer not null default 1, unique(user_id,lesson_id));
create table if not exists public.user_prompts (id uuid primary key, user_id uuid not null references auth.users(id) on delete cascade, source_id text, content jsonb not null default '{}', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), schema_version integer not null default 1);
create table if not exists public.user_agents (id uuid primary key, user_id uuid not null references auth.users(id) on delete cascade, source_id text, content jsonb not null default '{}', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), schema_version integer not null default 1);
create table if not exists public.projects (id uuid primary key, user_id uuid not null references auth.users(id) on delete cascade, content jsonb not null default '{}', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), schema_version integer not null default 1);
create table if not exists public.project_entities (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, project_id uuid not null references public.projects(id) on delete cascade, entity_type text not null, entity_id text not null, content jsonb not null default '{}', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), schema_version integer not null default 1, unique(project_id,entity_type,entity_id));
create table if not exists public.knowledge_documents (id uuid primary key, user_id uuid not null references auth.users(id) on delete cascade, project_id uuid references public.projects(id) on delete set null, content jsonb not null default '{}', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), schema_version integer not null default 1);
create table if not exists public.workflows (id uuid primary key, user_id uuid not null references auth.users(id) on delete cascade, content jsonb not null default '{}', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), schema_version integer not null default 1);
create table if not exists public.runtime_runs (id uuid primary key, user_id uuid not null references auth.users(id) on delete cascade, project_id uuid references public.projects(id) on delete set null, content jsonb not null default '{}', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), schema_version integer not null default 1);
create table if not exists public.favorites (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, entity_type text not null, entity_id text not null, content jsonb not null default '{}', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), schema_version integer not null default 1, unique(user_id,entity_type,entity_id));
create table if not exists public.recent_items (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, entity_type text not null, entity_id text not null, content jsonb not null default '{}', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), schema_version integer not null default 1, unique(user_id,entity_type,entity_id));
create table if not exists public.notifications (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, content jsonb not null default '{}', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), schema_version integer not null default 1);
create table if not exists public.onboarding_profiles (id uuid primary key default gen_random_uuid(), user_id uuid not null unique references auth.users(id) on delete cascade, content jsonb not null default '{}', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), schema_version integer not null default 1);
create table if not exists public.sync_metadata (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, domain text not null, device_id_hash text, content_hash text, last_confirmed_at timestamptz, content jsonb not null default '{}', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), schema_version integer not null default 1, unique(user_id,domain));
create table if not exists public.audit_events (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, event_type text not null, content jsonb not null default '{}', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), schema_version integer not null default 1);
create table if not exists public.account_roles (id uuid primary key default gen_random_uuid(), user_id uuid not null unique references auth.users(id) on delete cascade, role text not null check (role in ('learner','admin')), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), schema_version integer not null default 1);

alter table public.profiles enable row level security;
create policy "profiles select own" on public.profiles for select using (auth.uid() = id);
create policy "profiles insert own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles update own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles delete own" on public.profiles for delete using (auth.uid() = id);

do $$
declare table_name text;
begin
  foreach table_name in array array['user_preferences','user_progress','user_prompts','user_agents','projects','project_entities','knowledge_documents','workflows','runtime_runs','favorites','recent_items','notifications','onboarding_profiles','sync_metadata','audit_events']
  loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('create index if not exists %I on public.%I(user_id, updated_at desc)', table_name || '_owner_updated_idx', table_name);
    execute format('create policy "select own" on public.%I for select using (auth.uid() = user_id)', table_name);
    execute format('create policy "insert own" on public.%I for insert with check (auth.uid() = user_id)', table_name);
    execute format('create policy "update own" on public.%I for update using (auth.uid() = user_id) with check (auth.uid() = user_id)', table_name);
    execute format('create policy "delete own" on public.%I for delete using (auth.uid() = user_id)', table_name);
  end loop;
end $$;

alter table public.account_roles enable row level security;
create index if not exists account_roles_owner_idx on public.account_roles(user_id);
create policy "roles select own" on public.account_roles for select using (auth.uid() = user_id);

create or replace function public.set_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
do $$
declare table_name text;
begin
  foreach table_name in array array['profiles','user_preferences','user_progress','user_prompts','user_agents','projects','project_entities','knowledge_documents','workflows','runtime_runs','favorites','recent_items','notifications','onboarding_profiles','sync_metadata','audit_events','account_roles']
  loop
    execute format('drop trigger if exists set_updated_at on public.%I',table_name);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()',table_name);
  end loop;
end $$;

revoke all on function public.set_updated_at() from public;
