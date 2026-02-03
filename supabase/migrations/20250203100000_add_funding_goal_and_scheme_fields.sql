-- Add funding_goal to business_profiles; add key_benefit_display, required_documents, estimated_timeline to schemes

alter table public.business_profiles
  add column if not exists funding_goal text check (funding_goal in ('loan', 'subsidy', 'grant', 'any'));

comment on column public.business_profiles.funding_goal is 'User preference: loan, subsidy, grant, or any';

alter table public.schemes
  add column if not exists key_benefit_display text,
  add column if not exists required_documents text[] default '{}',
  add column if not exists estimated_timeline text;

comment on column public.schemes.key_benefit_display is 'e.g. Up to ₹50L or 25% subsidy';
comment on column public.schemes.required_documents is 'Checklist for application';
comment on column public.schemes.estimated_timeline is 'e.g. 4–6 weeks from application';
