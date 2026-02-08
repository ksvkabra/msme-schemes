-- Pending profiles: questionnaire data keyed by email before verification.
-- When user clicks magic link, auth callback merges into business_profiles and deletes here.
-- No user_id; server uses service role to read/write (RLS blocks anon).

create table if not exists public.pending_profiles (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  business_type text not null check (business_type in ('micro', 'small', 'medium', 'startup')),
  industry text not null,
  state text not null,
  turnover_range text not null,
  company_age text not null,
  funding_goal text check (funding_goal in ('loan', 'subsidy', 'grant', 'any')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger pending_profiles_updated_at
  before update on public.pending_profiles
  for each row execute function public.set_updated_at();

alter table public.pending_profiles enable row level security;

-- No policies: only service role (backend) can read/insert/update/delete.
-- Anon and authenticated users cannot access this table directly.
