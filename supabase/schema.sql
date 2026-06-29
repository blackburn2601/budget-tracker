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
-- AUTH GATE (single-user, email/password):
-- The app is now mandatory-auth. Only signed-in (authenticated) users may
-- read/write the shared snapshot row — the public `anon` role gets nothing.
-- This change only swaps access rules; it does NOT touch existing rows.
-- ---------------------------------------------------------------------------
drop policy if exists "anon full access" on public.budget_snapshots;
drop policy if exists "authenticated full access" on public.budget_snapshots;
create policy "authenticated full access"
  on public.budget_snapshots
  for all
  to authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------------------
-- One-time setup so the gate cannot be bypassed by self-registration:
--   1. Dashboard → Authentication → Providers → Email: DISABLE "Allow new users
--      to sign up" (public sign-ups off).
--   2. Dashboard → Authentication → Users → "Add user": create the single
--      account (email + password) that may access the app.
--
-- MULTI-USER LATER (each user their own data): add a user_id column and scope
-- the policy by it:
--   alter table public.budget_snapshots add column user_id uuid
--     references auth.users(id) default auth.uid();
--   drop policy if exists "authenticated full access" on public.budget_snapshots;
--   create policy "owner access" on public.budget_snapshots
--     for all to authenticated
--     using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- ---------------------------------------------------------------------------
