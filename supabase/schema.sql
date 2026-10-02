-- MET Campus Hub — Supabase schema
-- Run once in the Supabase SQL editor (Dashboard -> SQL -> New query).

create extension if not exists "pgcrypto";

-- ── Student accounts ───────────────────────────────────────────────
-- `email` is stored lower-cased and uniquely indexed so lookups are
-- case-insensitive. The client also normalises with
-- `email.toLowerCase().trim()` before every query and insert.
create table if not exists public.users (
  id              text primary key,
  full_name       text        not null,
  email           text        not null,
  password        text        not null,
  department      text        not null,
  year            text        not null,
  prn             text        not null default '',
  -- Written only by /api/auth/send-otp, consumed by /api/auth/verify-otp.
  -- Both are null whenever no reset is in flight.
  reset_otp       text,
  otp_expires_at  timestamptz,
  created_at      timestamptz not null default now()
);

create unique index if not exists users_email_lower_key
  on public.users (lower(email));

-- The reset routes write these with the service role key (RLS bypass), so the
-- browser client can neither read nor forge them. Run this after adding the
-- columns to an existing table:
--   alter table public.users add column if not exists reset_otp text;
--   alter table public.users add column if not exists otp_expires_at timestamptz;

-- ── Gear exchange listings ─────────────────────────────────────────
create table if not exists public.listings (
  id           text primary key,
  title        text        not null,
  subtitle     text,
  category     text        not null,
  listing_type text        not null check (listing_type in ('rent','sale','donate')),
  price        integer,
  price_unit   text check (price_unit in ('semester','one-time')),
  condition    text        not null,
  seller       text        not null,
  branch       text        not null,
  year         text        not null,
  spot         text        not null,
  phone        text        not null,
  posted_ago   text,
  featured     boolean     not null default false,
  verified     boolean     not null default false,
  created_at   timestamptz not null default now()
);

-- ── Row Level Security ─────────────────────────────────────────────
-- The anon key is a public credential, so policies must stay tight.
alter table public.users     enable row level security;
alter table public.listings  enable row level security;

-- Listings are public to read, and anyone with the anon key may insert one
-- (this demo has no auth provider yet). Reads + inserts only — no updates or
-- deletes are exposed.
create policy "listings are readable by everyone"
  on public.listings for select
  using (true);

create policy "anyone may publish a listing"
  on public.listings for insert
  with check (true);

-- NOTE: `users` has no policies on purpose. Without a policy the anon key can
-- read nothing, so the table is inert until you wire up Supabase Auth
-- (e.g. `alter table public.users enable row level security;` plus policies
-- scoped to `auth.uid()`). Do not add an open policy here — it would expose
-- every student's password hash to the browser.