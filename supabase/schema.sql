-- FORGE tracker — schema
-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New query)

create extension if not exists "pgcrypto";

create table if not exists program (
  id text primary key default 'default',
  days jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists exercise_library (
  id text primary key default 'default',
  items jsonb not null default '[]'::jsonb
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  date timestamptz not null default now(),
  day_id text,
  day_title text,
  weekday text,
  exercises jsonb not null default '[]'::jsonb,
  mobility jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists bodyweight (
  id uuid primary key default gen_random_uuid(),
  date timestamptz not null default now(),
  weight numeric not null,
  created_at timestamptz not null default now()
);

-- Row Level Security
alter table program enable row level security;
alter table exercise_library enable row level security;
alter table sessions enable row level security;
alter table bodyweight enable row level security;

-- This app is single-user and uses the public anon key (same pattern as most
-- personal Supabase projects). These policies allow full read/write to
-- anyone holding the anon key + project URL. That's fine as long as you
-- don't publish those values publicly. If you want real per-user auth later,
-- swap these for policies scoped to auth.uid().
create policy "anon full access" on program for all using (true) with check (true);
create policy "anon full access" on exercise_library for all using (true) with check (true);
create policy "anon full access" on sessions for all using (true) with check (true);
create policy "anon full access" on bodyweight for all using (true) with check (true);
