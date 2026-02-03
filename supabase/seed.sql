-- Optional seed: sample schemes for development
-- Run after migrations. eligibility_rules shape matches lib/db/types.ts and lib/eligibility/engine.ts

insert into public.schemes (name, type, eligibility_rules, benefit_summary, states_applicable, key_benefit_display, required_documents, estimated_timeline)
values
  (
    'PMEGP',
    'subsidy',
    '{"business_types":["micro","small"],"states":["*"],"turnover_max":100,"company_age_max_years":3}'::jsonb,
    'Credit-linked capital subsidy for micro enterprises. Margin money assistance.',
    null,
    'Up to 25% margin money subsidy',
    array['Business plan', 'Identity proof', 'Address proof', 'Bank statement'],
    '4–6 weeks from application'
  ),
  (
    'MUDRA Shishu',
    'loan',
    '{"business_types":["micro"],"turnover_max":5}'::jsonb,
    'Loans up to Rs 50,000 for small businesses.',
    null,
    'Up to ₹50,000',
    array['ID proof', 'Passport size photo', 'Business proof'],
    '1–2 weeks'
  ),
  (
    'State MSME Grant (Sample)',
    'grant',
    '{"business_types":["micro","small"],"states":["Maharashtra","Gujarat"],"industries":["Manufacturing","Services"]}'::jsonb,
    'One-time grant for new MSMEs in selected states.',
    array['Maharashtra','Gujarat'],
    'One-time grant up to ₹10L',
    array['MSME certificate', 'GST registration', 'Project report'],
    '6–8 weeks'
  )
on conflict do nothing;
