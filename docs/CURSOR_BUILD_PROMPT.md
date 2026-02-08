# Cursor Build Prompt — Govt Schemes & MSME Eligibility Platform

**Use this prompt in Cursor to build or complete the application page by page. Ensure no functionality is missing.**

---

## Context

This is a **Govt Schemes & MSME Eligibility Platform**: startups and MSMEs enter their details, get matched to government schemes/funding, and can apply and track applications. There is an **end-user flow** and an **admin flow**. The app uses Next.js (App Router), TypeScript, Tailwind, and Supabase. Some pages and APIs already exist; your job is to align everything with the requirements below and fill gaps.

**Current state (summary):**
- Landing page exists with Hero, Why us, What you’re missing, Testimonials, How it works. CTA goes to `/eligibility`.
- `/eligibility` exists but currently: user enters email → magic link sent → user must **click the link** to get a session → then they can do onboarding. **Required change:** user should **continue in the same flow without redirect**; verification email is sent in the background; data is stored by email; after questionnaire we show “Verify email to continue” and **do not show schemes** until they verify.
- Onboarding (questionnaire) exists at `/dashboard/onboarding` with 6 steps; it requires auth. **Required change:** the eligibility flow should allow the user to complete the **entire questionnaire (email + all business details) in one continuous journey** without verifying first; store everything keyed by email; after submit show “Verify your email to continue”; only after they click the verification link show the dashboard with schemes.
- Dashboard, scheme detail, applications, tracker, and admin (scheme CRUD) exist. Keep and align with the flow above (dashboard/schemes only after verification).

---

## Requirements Overview

### End-user flow

1. **Landing page** (`/`)
   - **Banner (hero):** Strong, beautiful design with a clear theme (e.g. fintech/startup-friendly, not “government” look). **One CTA only:** “Check eligibility” (or “Check my eligibility”).
   - **Why us** — Why this platform / why trust us.
   - **What they’re missing out on** — Subsidies, loans, grants they might be missing.
   - **Testimonials** — Short placeholder or real testimonials.
   - **Optional 5th section** — Only if it adds clear value (e.g. “How it works” in 3 steps, or a simple FAQ). **Total: 4–5 sections.** Remove any section that doesn’t add value.
   - Mobile-first, consistent design system (colors, typography, spacing).

2. **Check eligibility — single continuous flow (no redirect)**
   - User clicks “Check eligibility” → lands on **one flow** (e.g. `/eligibility` or a wizard that stays on one route).
   - **Step 1:** Enter **email** (unique identifier). On submit (or on blur):
     - **Send verification email in the background** (e.g. magic link via Supabase or Resend). Do **not** redirect the user and do **not** show “Check your email” as a blocking screen.
     - **Keep the user on the same form / same journey** and move to the next step (business details).
   - **Step 2 … N:** Collect **all details needed to match govt schemes and funding**, e.g.:
     - Business type (Startup / Micro / Small / Medium)
     - Industry / sector
     - State / location
     - Company age
     - Turnover range
     - Funding intent (loan / subsidy / grant)
     - Any other fields needed for your matching rules (keep structure consistent with scheme eligibility config).
   - One question per screen or small groups, progress indicator, button-based where possible, minimal typing.
   - **On final submit:**
     - Store **all** information (email + business details) keyed by **email** (unique). Use a table that supports “pending” profiles (e.g. `pending_profiles` or `business_profiles` with an optional `user_id` and `email_verified_at`). If the user later verifies, merge/link to `auth.users`.
     - **Do not redirect to dashboard.** Show a **“Verify your email to continue”** screen: explain that a link was sent to their email and they must click it to see their matched schemes. Do **not** show any scheme list or dashboard yet.

3. **After verification**
   - When the user clicks the verification link, complete auth (e.g. Supabase `exchangeCodeForSession`), link the stored profile to the authenticated user (same email), run scheme matching, and redirect to **dashboard**.
   - **Dashboard** shows only to **verified** users: summary (number of eligible schemes, confidence), list of matched schemes with “View details” / “Apply”. If not verified, do not show dashboard or scheme list (redirect back to “Verify your email” or eligibility).

4. **Rest of the flow (already planned / implemented)**
   - **Scheme detail** (`/schemes/[id]`): what they get, why they qualify, required documents, timeline, “Start application”, “Talk to advisor”.
   - **Applications:** create application (`/applications/new?scheme_id=...`), list (`/applications`), tracker (`/applications/[id]`) with timeline (e.g. Eligibility confirmed → Documents submitted → Bank review → Approval → Disbursal) and status/owner where useful.
   - **Help** (e.g. `/help`): placeholders for chat / book call / upload if desired.
   - **Auth:** Sign out, and optionally “Log in” for returning users (e.g. from landing header).

### Admin flow

- **One fixed admin account.** You decide the best way: e.g. env variable `ADMIN_EMAIL`; only that email can access admin routes. No signup for admin; single account is enough.
- **Admin can:**
  - **Add** schemes (name, type, benefit summary, key benefit display, required documents, estimated timeline, states applicable, etc.).
  - **Edit** existing schemes.
  - **Remove** schemes.
  - **Configure eligibility rules** for each scheme (e.g. business types, industries, states, turnover range, company age, funding type) in a structured way so that matching logic stays consistent.
- Admin routes must be **server-protected** (middleware + API checks): only the admin email can access `/admin` and admin APIs.

### Matching logic

- When a user has a (verified) profile, use their stored information to **compute which schemes they are eligible for**.
- **Option A (recommended for MVP):** **Deterministic rule-based matching.** Store eligibility rules in a **consistent structure** (e.g. JSON in DB: business_types, industries, states, turnover_min/max, company_age_min/max, funding_types). Server-side engine compares profile to each scheme’s rules and returns eligible schemes, match score, and missing requirements. No external API cost; predictable.
- **Option B:** Use an **LLM (e.g. OpenAI)** to match profile to schemes. Only if you prefer it and can keep outputs stable; add API key in env and handle errors. Cursor can choose A or B; document the choice.
- Store results in something like `user_scheme_matches` (user_id, scheme_id, match_score, missing_requirements) and show them on the dashboard. Recompute when profile or schemes change.

---

## Page-by-page checklist (build in this order)

Use this to ensure nothing is missed. For each page/route, implement or adjust as needed.

### Public

| # | Route / area | What to implement / verify |
|---|--------------|----------------------------|
| 1 | **Landing** `/` | Hero (one CTA: “Check eligibility”), Why us, What they’re missing, Testimonials, optional 5th section (4–5 total). Consistent design theme. CTA goes to eligibility flow. |
| 2 | **Eligibility flow** (e.g. `/eligibility` or `/eligibility/[...]`) | (a) Email step: input + send verification in background, **no redirect**, move to next step. (b) Questionnaire steps: all fields for scheme matching, progress, store by email. (c) Final submit: save to DB keyed by email, show **“Verify your email to continue”** only (no schemes). |
| 3 | **Auth callback** (e.g. `/auth/callback`) | On verification link click: exchange code for session, link pending profile to user by email, run matching, redirect to `/dashboard`. |

### Protected (verified users only)

| # | Route / area | What to implement / verify |
|---|--------------|----------------------------|
| 4 | **Dashboard** `/dashboard` | Only for verified users. Summary card (eligible count, confidence). List matched schemes; “View details”, “Apply”. If no profile, prompt to complete onboarding (or redirect to eligibility). |
| 5 | **Onboarding** (if separate) | If you keep `/dashboard/onboarding` for already-logged-in users, ensure it fits the same data model. Otherwise onboarding is inside the eligibility flow above. |
| 6 | **Scheme detail** `/schemes/[id]` | What they get, why they qualify, documents, timeline. CTAs: “Start application”, “Talk to advisor”. |
| 7 | **New application** `/applications/new?scheme_id=...` | Form to create application (scheme_id, optional bank name, status). POST to apply API. Redirect to applications list. |
| 8 | **Applications list** `/applications` | List user’s applications with status; link to tracker. |
| 9 | **Application tracker** `/applications/[id]` | Timeline: Eligibility → Documents → Bank review → Approval → Disbursal. Status and owner (user/bank/system) per step. |
| 10 | **Help** `/help` | Placeholder or simple UI for help (chat / book call / upload). |
| 11 | **Layout / nav** | Protected layout: Dashboard, Schemes, Applications, Help, Sign out. Optionally “Log in” for returning users on landing. |

### Admin

| # | Route / area | What to implement / verify |
|---|--------------|----------------------------|
| 12 | **Admin guard** | Middleware + API: only `ADMIN_EMAIL` can access `/admin` and admin APIs. |
| 13 | **Admin dashboard** `/admin` | List schemes; “Add scheme”; Edit / Delete per scheme. |
| 14 | **Add scheme** `/admin/schemes/new` | Form: name, type, benefit summary, key benefit, documents, timeline, states, **eligibility rules** (business type, industry, state, turnover, company age, funding type, etc.) in a consistent structure. |
| 15 | **Edit scheme** `/admin/schemes/[id]/edit` | Same form as add, pre-filled. Save updates. |
| 16 | **Admin APIs** | POST create scheme, PUT update scheme, DELETE scheme. All check admin email; use service role or RLS that allows only admin. |

### Data & APIs

| # | Item | What to implement / verify |
|---|------|----------------------------|
| 17 | **Pending profiles** | Table/store for profile data keyed by email before verification (e.g. `pending_profiles` or `business_profiles` with nullable `user_id` and verification flag). On verification, link to `auth.users` and move/merge to main profile. |
| 18 | **Eligibility submission API** | Accept email + all questionnaire fields; store keyed by email (pending). Send verification email if not already sent. No session required for this step. |
| 19 | **Matching engine** | Input: user profile (from DB). Output: list of schemes with score and missing requirements. Rule-based (Option A) or LLM (Option B). Same structure as admin eligibility config. |
| 20 | **user_scheme_matches** | Persist matches for verified users; dashboard reads from here (or recomputes on load). |

---

## Technical constraints

- **Stack:** Next.js (App Router), TypeScript, Tailwind, Supabase (auth + DB). Optional: Resend (or Supabase) for verification emails; OpenAI only if Option B for matching.
- **No separate backend service:** Keep everything in Next.js API routes and Supabase.
- **One CTA on landing:** “Check eligibility” only (no secondary primary action).
- **Email = unique identifier** for the eligibility flow; after verification, link to Supabase user id.
- **4–5 sections on landing;** remove sections that don’t add value.

---

## Definition of done for the full app

- [ ] User can land on a beautiful landing page (4–5 sections, one CTA) and click “Check eligibility”.
- [ ] User completes email + full questionnaire **in one flow without redirect**; verification email is sent in the background.
- [ ] All data is stored keyed by email; on final submit user sees **“Verify your email to continue”** and **no schemes**.
- [ ] After clicking the verification link, user is logged in, profile is linked, matching runs, and they see the **dashboard with matched schemes**.
- [ ] User can view scheme detail, start an application, see applications list and tracker.
- [ ] Only one admin account (e.g. `ADMIN_EMAIL`); admin can add/edit/remove schemes and configure eligibility rules.
- [ ] Matching logic is consistent (rule-based or LLM); structure of rules aligns between admin config and engine.
- [ ] No functionality from the original plan or this prompt is missing.

Use this prompt to build or refactor the app page by page, filling gaps and aligning the eligibility and verification flow as described.
