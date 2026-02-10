-- Store entity type and raw questionnaire responses for eligibility flow and dashboard display.
-- pending_profiles: keyed by email before verification.
-- business_profiles: after login; migrated from pending_profiles.

alter table public.pending_profiles
  add column if not exists entity_type text check (entity_type in ('startup', 'msme')),
  add column if not exists questionnaire_responses jsonb default '{}',
  add column if not exists step2_responses jsonb default '{}';

comment on column public.pending_profiles.entity_type is 'Eligibility path: startup or msme';
comment on column public.pending_profiles.questionnaire_responses is 'Raw answers from startup or msme flow (key -> value)';
comment on column public.pending_profiles.step2_responses is 'Optional extended questionnaire answers';

alter table public.business_profiles
  add column if not exists entity_type text check (entity_type in ('startup', 'msme')),
  add column if not exists questionnaire_responses jsonb default '{}',
  add column if not exists step2_responses jsonb default '{}';

comment on column public.business_profiles.entity_type is 'Eligibility path: startup or msme';
comment on column public.business_profiles.questionnaire_responses is 'Raw answers from startup or msme flow';
comment on column public.business_profiles.step2_responses is 'Optional extended questionnaire answers';
