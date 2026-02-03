-- MSME Schemes MVP: initial schema
-- Run in Supabase SQL Editor or via: supabase db push

-- business_profiles (user_id links to auth.users)
create table if not exists public.business_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_type text not null check (business_type in ('micro', 'small', 'medium', 'startup')),
  industry text not null,
  state text not null,
  turnover_range text not null,
  company_age text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

-- schemes (reference data, admin-managed)
create table if not exists public.schemes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null,
  eligibility_rules jsonb not null default '{}',
  benefit_summary text,
  states_applicable text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- user_scheme_matches (computed matches)
create table if not exists public.user_scheme_matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scheme_id uuid not null references public.schemes(id) on delete cascade,
  match_score int not null default 0 check (match_score >= 0 and match_score <= 100),
  missing_requirements text[] not null default '{}',
  created_at timestamptz default now(),
  unique(user_id, scheme_id)
);

-- applications
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scheme_id uuid not null references public.schemes(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'submitted', 'under_review', 'approved', 'rejected')),
  bank_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger business_profiles_updated_at
  before update on public.business_profiles
  for each row execute function public.set_updated_at();
create trigger applications_updated_at
  before update on public.applications
  for each row execute function public.set_updated_at();

-- RLS
alter table public.business_profiles enable row level security;
alter table public.schemes enable row level security;
alter table public.user_scheme_matches enable row level security;
alter table public.applications enable row level security;

-- business_profiles: user can read/insert/update own
create policy "Users can read own business_profile"
  on public.business_profiles for select
  using (auth.uid() = user_id);
create policy "Users can insert own business_profile"
  on public.business_profiles for insert
  with check (auth.uid() = user_id);
create policy "Users can update own business_profile"
  on public.business_profiles for update
  using (auth.uid() = user_id);

-- schemes: everyone can read
create policy "Anyone can read schemes"
  on public.schemes for select
  using (true);

-- user_scheme_matches: user can read own
create policy "Users can read own matches"
  on public.user_scheme_matches for select
  using (auth.uid() = user_id);
create policy "Users can insert own matches"
  on public.user_scheme_matches for insert
  with check (auth.uid() = user_id);
create policy "Users can update own matches"
  on public.user_scheme_matches for update
  using (auth.uid() = user_id);

-- applications: user can CRUD own
create policy "Users can read own applications"
  on public.applications for select
  using (auth.uid() = user_id);
create policy "Users can insert own applications"
  on public.applications for insert
  with check (auth.uid() = user_id);
create policy "Users can update own applications"
  on public.applications for update
  using (auth.uid() = user_id);
create policy "Users can delete own applications"
  on public.applications for delete
  using (auth.uid() = user_id);

-- Optional: storage bucket for documents (run in dashboard or add migration)
-- insert into storage.buckets (id, name, public) values ('documents', 'documents', false);
-- storage policies: allow authenticated users to upload to their folder
