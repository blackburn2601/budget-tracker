-- ===========================================================================
-- Budget Tracker — Supabase schema
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- Stores the whole app state as one JSON snapshot per "row key" (single user).
-- ===========================================================================

create table if not exists public.budget_snapshots (
  id          text primary key,           -- row key, e.g. 'default'
  data        jsonb not null,             -- { scenarios: [...], activeScenarioId }
  updated_at  timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.budget_snapshots enable row level security;

-- ---------------------------------------------------------------------------
-- OPTION A (simplest, single private user with the anon key):
-- Allow the anon role full access to this one table. Only do this if the
-- Supabase URL/anon key are NOT shared publicly (e.g. a personal deployment).
-- ---------------------------------------------------------------------------
drop policy if exists "anon full access" on public.budget_snapshots;
create policy "anon full access"
  on public.budget_snapshots
  for all
  to anon
  using (true)
  with check (true);

-- ---------------------------------------------------------------------------
-- OPTION B (recommended if you add Supabase Auth later): restrict by user.
-- Add a `user_id uuid` column referencing auth.users and replace the policy:
--
--   alter table public.budget_snapshots add column user_id uuid
--     references auth.users(id) default auth.uid();
--   drop policy if exists "anon full access" on public.budget_snapshots;
--   create policy "owner access" on public.budget_snapshots
--     for all to authenticated
--     using (auth.uid() = user_id)
--     with check (auth.uid() = user_id);
-- ---------------------------------------------------------------------------
