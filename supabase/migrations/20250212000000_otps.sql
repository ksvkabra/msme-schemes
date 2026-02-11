-- OTPs for email verification: we send codes via Resend and verify in our API (no Supabase auth email).
create table if not exists public.otps (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  code text not null,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

create index if not exists otps_email_expires_idx on public.otps (email, expires_at);

alter table public.otps enable row level security;

-- No policies: only service role (backend) can read/write. Frontend never touches this table.
