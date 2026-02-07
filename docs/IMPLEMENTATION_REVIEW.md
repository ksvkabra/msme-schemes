# Initial Flow Implementation Review

## Verdict: **Ready** (with checklist below)

The initial flow is implemented end-to-end. A few cleanups were done and one seed fix applied.

---

## Flow coverage

| Step | Route / action | Status |
|------|----------------|--------|
| 1. Landing | `/` — headline, "Check my eligibility", "How it works" | ✅ |
| 2. Auth | `/login` — email magic link (click link in email); `?next=` preserved | ✅ |
| 3. Callback | `/auth/callback` — exchanges `code` for session, redirects to `next` | ✅ |
| 4. Onboarding | `/dashboard/onboarding` — 6 steps, progress bar, button-based, submits to `/api/onboarding` | ✅ |
| 5. Dashboard | `/dashboard` — summary card (eligible count, High/Medium/Low), scheme cards, View details / Apply | ✅ |
| 6. Scheme detail | `/schemes/[id]` — benefits, why qualify, documents, timeline, Start application / Talk to advisor | ✅ |
| 7. Apply | `/applications/new?scheme_id=` — POST `/api/apply` | ✅ |
| 8. Applications list | `/applications` — list with status, link to tracker | ✅ |
| 9. Tracker | `/applications/[id]` — timeline (Eligibility → Disbursal), status from DB | ✅ |
| 10. Help | `/help` — chat / book call / upload (placeholders) | ✅ |
| 11. Eligibility entry | `/eligibility` — single email, send verification link, no redirect; CTA continues to onboarding after click | ✅ |
| 12. Admin | `/admin` — list/add/edit/delete schemes, configure eligibility rules (env `ADMIN_EMAIL`) | ✅ |
| Sign out | POST `/api/auth/signout` → redirect `/` | ✅ |

---

## Auth & middleware

- **Protected paths:** `/dashboard`, `/schemes`, `/applications`, `/help` — unauthenticated users redirect to `/login?next=...`.
- **Admin paths:** `/admin` — only user whose email equals `ADMIN_EMAIL` can access; others redirect to `/dashboard`.
- **Auth paths:** `/login`, `/signup` — authenticated users redirect to `/dashboard`.
- **Eligibility:** `/eligibility` — public; authenticated users redirect to `/dashboard`.
- **Supabase:** Session cookies set via `response.cookies` in middleware; server client uses cookies(); callback uses `exchangeCodeForSession` for magic-link flow.

---

## APIs

- **POST `/api/onboarding`** — Validates body (business_type, industry, state, turnover_range, company_age, funding_goal), upserts `business_profiles`. Auth required.
- **GET `/api/match-schemes`** — Loads profile + schemes, runs eligibility engine, upserts `user_scheme_matches`. Auth required. (Dashboard also runs match on load.)
- **POST `/api/apply`** — Inserts into `applications` (scheme_id, status, bank_name). Auth required.
- **GET `/api/schemes/[id]`** — Returns scheme by id. Used by application form.
- **POST `/api/send-email`** — Sends eligibility summary via Resend. Not called from UI yet. See [EMAIL_FLOWS.md](./EMAIL_FLOWS.md) for how this differs from login/confirm-email.
- **POST `/api/auth/signout`** — Signs out and redirects to `/`.

---

## Database

- **Migrations:**  
  - `20250203000000_initial_schema.sql` — business_profiles, schemes, user_scheme_matches, applications, RLS, triggers.  
  - `20250203100000_add_funding_goal_and_scheme_fields.sql` — funding_goal, key_benefit_display, required_documents, estimated_timeline.
- **Seed:** `supabase/seed.sql` — 3 sample schemes. **Eligibility rules use turnover in lakhs** (engine expects lakhs); seed was updated from rupees to lakhs.

---

## Fixes applied in this review

1. **Duplicate routes removed** — `app/dashboard`, `app/applications`, `app/schemes`, `app/help` were duplicates of `app/(protected)/*`. Deleted the top-level duplicates so only `(protected)` routes remain and the shared layout + nav apply consistently.
2. **Seed turnover units** — Eligibility engine compares turnover in **lakhs**. Seed `turnover_max` values were changed from rupees to lakhs (e.g. 10000000 → 100, 500000 → 5) so matching and messages are correct.

---

## Before first run (your checklist)

1. **Supabase**
   - [ ] Run `supabase/migrations/20250203000000_initial_schema.sql`.
   - [ ] Run `supabase/migrations/20250203100000_add_funding_goal_and_scheme_fields.sql`.
   - [ ] Optional: run `supabase/seed.sql` for sample schemes.
   - [ ] Auth → URL Configuration: Site URL = `http://localhost:3000` (or your production URL), Redirect URLs include `http://localhost:3000/auth/callback` (and your production callback URL in prod).
   - [ ] Auth → Email: enable Email provider (for OTP / magic link).

2. **Env**
   - [ ] `.env` has `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (and `SUPABASE_SECRET_KEY` if using service-role).
   - [ ] In production, set `NEXT_PUBLIC_APP_URL` to your site URL so the “Confirm your mail” link in auth emails points to your app, not localhost. See [EMAIL_FLOWS.md](./EMAIL_FLOWS.md).
   - [ ] `RESEND_API_KEY` only if you will use send-email (optional for initial flow).
   - [ ] `ADMIN_EMAIL`: set to the email that can access `/admin` (scheme CRUD, eligibility rules). See `.example.env`.

3. **Run**
   - [ ] `npm run dev` → open `http://localhost:3000` → "Check my eligibility" → log in → onboarding → dashboard → scheme detail → apply → applications list → tracker.

---

## Optional / later

- Wire "Email me my summary" (or similar) on the dashboard to POST `/api/send-email`. See [EMAIL_FLOWS.md](./EMAIL_FLOWS.md).
- Add `/signup` page if you want a dedicated signup route (middleware already redirects `/signup` when logged in).
- Supabase Storage + policies for "Upload documents" on Help (bucket + RLS).

---

## Summary

Initial flow is **ready**: landing → login (OTP or magic link) → onboarding → dashboard (matches + summary) → scheme detail → apply → applications list → tracker, with shared nav and auth. Complete the checklist above and you can run it end-to-end.
