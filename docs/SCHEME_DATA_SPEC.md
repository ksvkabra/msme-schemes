# Scheme Data Specification

This document describes what information to store for each government/MSME scheme, based on the current database schema and common practice (e.g. myScheme.gov.in, MSME portal, scheme guidelines).

## Current Database Schema (`public.schemes`)

| Column | Type | Purpose |
|--------|------|---------|
| `id` | uuid | Primary key (auto) |
| `name` | text | Official scheme name (e.g. PMEGP, MUDRA Shishu) |
| `type` | text | One of: `loan`, `subsidy`, `grant` |
| `eligibility_rules` | jsonb | Structured rules for matching (see below) |
| `benefit_summary` | text | Short description of what the scheme offers |
| `states_applicable` | text[] | States where scheme applies; `null` or empty = all states |
| `key_benefit_display` | text | One-line highlight (e.g. "Up to ₹50L or 25% subsidy") |
| `required_documents` | text[] | Checklist of documents needed to apply |
| `estimated_timeline` | text | e.g. "4–6 weeks from application" |
| `created_at` / `updated_at` | timestamptz | Auto-managed |

## Eligibility Rules (JSONB)

The matching engine uses these keys inside `eligibility_rules`. All are optional.

| Key | Type | Meaning |
|-----|------|---------|
| `business_types` | string[] | Allowed: `micro`, `small`, `medium`, `startup` |
| `industries` | string[] | Allowed industries (e.g. Manufacturing, Services) |
| `states` | string[] | Allowed states; use `["*"]` for nationwide |
| `turnover_min` | number | Min turnover in lakhs |
| `turnover_max` | number | Max turnover in lakhs |
| `company_age_min_years` | number | Min age of business in years |
| `company_age_max_years` | number | Max age of business in years |
| `funding_types` | string[] | Allowed: `loan`, `subsidy`, `grant` |

## Information to Store per Scheme (Recommendation)

Based on official portals (myScheme, MSME.gov.in, scheme PDFs), each scheme record should include:

1. **Identity**
   - **Name** – Official name (e.g. Prime Minister's Employment Generation Programme).
   - **Type** – Funding type: loan / subsidy / grant.

2. **Eligibility (for matching)**
   - Business type (micro / small / medium / startup).
   - Industry / sector (if restricted).
   - State/region (if not nationwide).
   - Turnover limits (min/max in lakhs).
   - Company age limits (min/max years).
   - Funding preference (if scheme is only for certain funding types).

3. **Benefits**
   - **Benefit summary** – Short narrative (one or two sentences).
   - **Key benefit display** – One line for UI (e.g. "Up to 25% margin money subsidy", "Loan up to ₹50,000").

4. **Application**
   - **Required documents** – List of documents needed (e.g. ID proof, business plan, MSME certificate).
   - **Estimated timeline** – e.g. "4–6 weeks from application", "1–2 weeks".

5. **Coverage**
   - **States applicable** – List of states or "all" (stored as array or `["*"]` in rules).

### Optional / Future Fields

- **Application URL** – Link to official application portal (could be added as a column later).
- **Sector/category** – e.g. "Employment", "Credit", "Technology" (for filtering).
- **FAQs** – Could be stored as JSONB or a separate table if needed.
- **Implementing agency** – e.g. KVIC, Banks, State DICs (for display only).

The current schema already supports the core fields; only application URL and sector are possible future additions.

## Excel Sheet Format for Bulk Data

Use the sheet format described in **`scripts/README_SCHEME_IMPORT.md`**. Each scheme is **one row** in an Excel workbook (.xlsx). The Python script **`scripts/excel_to_schemes_sql.py`** reads the active sheet and generates `INSERT` SQL for `public.schemes`. Run the generated SQL in the Supabase SQL Editor (or via `psql`) to populate the database. A template with the correct columns can be generated with **`scripts/create_sample_excel.py`**.
