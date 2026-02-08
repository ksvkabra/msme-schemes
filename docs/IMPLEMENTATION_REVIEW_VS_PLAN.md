# Implementation Review vs. Original Plan

This document compares the current codebase to the **Cursor TODO Execution Plan** (Govt Schemes & MSME Eligibility Platform) so we can fix gaps and align behaviour.

---

## PHASE 0 — Project Initialization ✅

| Item | Plan | Current | Status |
|------|------|---------|--------|
| Next.js App Router, TypeScript | ✓ | ✓ | OK |
| Tailwind, ESLint, absolute imports | ✓ | ✓ | OK |
| Folder structure (app, components, lib, types) | ✓ | app, lib, types; no `components/` | Minor: shared UI could live in `components/` |
| Supabase project, email auth, tables, RLS | ✓ | ✓ | OK |
| Email service (verification, utility) | Send verification on email entry | Magic link via Supabase; Resend for eligibility summary | OK (verification = magic link) |

**Verdict:** Phase 0 is done. Optional: add a `components/` folder for shared UI.

---

## PHASE 1 — Landing Page ✅

| Item | Plan | Current | Status |
|------|------|---------|--------|
| Hero, one CTA: "Check Eligibility" | ✓ | ✓ CTA → `/eligibility` | OK |
| Why This Platform | ✓ | ✓ | OK |
| What User Is Missing Out On | ✓ | ✓ | OK |
| Testimonials | ✓ | ✓ Placeholder | OK |
| How it works (3 steps, optional) | ✓ | ✓ | OK |
| Mobile-first, non-government look | ✓ | ✓ | OK |

**Verdict:** Landing matches the plan.

---

## PHASE 2 — Eligibility Entry Flow ⚠️ Partial

| Item | Plan | Current | Status |
|------|------|---------|--------|
| **TODO 2.1** Email entry at `/eligibility` | Single email field | ✓ | OK |
| On submit: send verification email in background | ✓ | ✓ `signInWithOtp` sends magic link | OK |
| Do NOT redirect user | ✓ | ✓ Shows "Check your email" | OK |
| Create a **temporary user session** | User can continue without verifying first | **Not implemented.** Session only exists after user clicks magic link. | **Gap** |
| Email as unique identifier | ✓ | ✓ (via Supabase auth) | OK |
| **TODO 2.2** Allow unverified users to continue onboarding | Unverified can do questionnaire | **Not implemented.** Must click link to get session; no "unverified" state. | **Gap** |
| Block dashboard & schemes until verified | ✓ | Implicit: no session = no access | OK |
| Store verification state server-side | N/A if no unverified flow | Supabase handles verified via session | OK for current flow |

**Verdict:** Current flow is: enter email → get link → **must click link** → then onboarding. The plan wanted: enter email → verification sent in background → **continue to questionnaire without clicking** → after submit show "Verify your email to continue" → then gate dashboard until verified. That "unverified session" flow is **not** implemented.

**Options:**  
- **A)** Keep current behaviour (verify first, then onboarding). Simpler, matches Supabase model.  
- **B)** Implement unverified flow: e.g. cookie/session keyed by email, save questionnaire to a `pending_profiles` (or similar) table, merge on verification. More work.

---

## PHASE 3 — Eligibility Questionnaire ✅

| Item | Plan | Current | Status |
|------|------|---------|--------|
| Multi-step form, progress indicator | ✓ | ✓ 6 steps, progress bar | OK |
| Business type, industry, state, company age, turnover, funding intent | ✓ | ✓ | OK |
| Optional: export / manufacturing / R&D | Optional | Not collected | OK to skip |
| One question per screen, button-based, minimal typing | ✓ | ✓ | OK |
| Save incrementally | "Save answers incrementally" | Single submit at end to `/api/onboarding` | **Partial:** no per-step save; acceptable for MVP |
| **TODO 3.2** Persist in `business_profiles`, link to email | ✓ | ✓ (linked to `user_id` after auth) | OK |
| **TODO 3.3** On final submit: show "Verify your email to continue", DO NOT show schemes | Show verify screen, no schemes yet | **Not implemented.** After submit we redirect to `/dashboard` and show schemes. | **Gap** (only relevant if Phase 2 unverified flow exists) |

**Verdict:** Questionnaire and persistence are correct. "Verify your email to continue" screen only applies if we add the unverified flow (Phase 2 Option B).

---

## PHASE 4 — Email Verification Gate ✅ (for current flow)

| Item | Plan | Current | Status |
|------|------|---------|--------|
| Once verified: allow dashboard, trigger matching | ✓ | ✓ | OK |
| If not verified: block dashboard & scheme routes | ✓ | No session = redirect to login | OK |

**Verdict:** With current "verify then session" model, the gate is correct.

---

## PHASE 5 — Scheme Matching ✅

| Item | Plan | Current | Status |
|------|------|---------|--------|
| Rule-based matching, structured rules (JSON) | ✓ | ✓ `eligibility_rules` in DB, engine in `lib/eligibility/engine.ts` | OK |
| Business type, industry, state, turnover, company age, funding type | ✓ | ✓ + `funding_types` in rules | OK |
| Output: eligible schemes, match confidence, missing requirements | ✓ | ✓ score 0–100, missing_requirements | OK |
| Store in `user_scheme_matches` | ✓ | ✓ Dashboard runs match and upserts | OK |
| Recompute if schemes change | ✓ | Dashboard reload recomputes | OK |

**Verdict:** Matching and storage match the plan.

---

## PHASE 6 — User Dashboard ✅

| Item | Plan | Current | Status |
|------|------|---------|--------|
| Summary: eligible count, confidence (high/medium) | ✓ | ✓ | OK |
| Scheme cards: name, benefit, why eligible, missing, "View Details" | ✓ | ✓ | OK |
| Clean, trust-first UI | ✓ | ✓ | OK |

**Verdict:** Dashboard matches the plan.

---

## PHASE 7 — Scheme Detail ✅

| Item | Plan | Current | Status |
|------|------|---------|--------|
| What user gets, why they qualify, documents, timeline | ✓ | ✓ | OK |
| CTAs: Start Application, Talk to Advisor | ✓ | ✓ | OK |

**Verdict:** Scheme detail matches the plan.

---

## PHASE 8 — Application Tracker ✅

| Item | Plan | Current | Status |
|------|------|---------|--------|
| Timeline: Eligibility → Documents → Bank review → Approval → Disbursal | ✓ | ✓ | OK |
| Each step: status, explanation, owner (user/bank/system) | ✓ | ✓ Owner label added | OK |

**Verdict:** Tracker matches the plan.

---

## PHASE 9 — Admin Flow ✅

| Item | Plan | Current | Status |
|------|------|---------|--------|
| Single fixed admin (env allowlist / admin email) | ✓ | ✓ `ADMIN_EMAIL` in env, middleware + layout check | OK |
| Admin dashboard: add / edit / delete schemes | ✓ | ✓ `/admin`, `/admin/schemes/new`, `/admin/schemes/[id]/edit` | OK |
| Configure eligibility: business type, industry, state, turnover, company age, funding type | ✓ | ✓ SchemeForm + API | OK |
| Server-protected, secure | ✓ | ✓ Middleware + API check `isAdminEmail` | OK |

**Verdict:** Admin flow matches the plan.

---

## PHASE 10 — Access Control ✅

| Item | Plan | Current | Status |
|------|------|---------|--------|
| Public: landing, eligibility | ✓ | ✓ | OK |
| Protected: dashboard, schemes, applications | ✓ | ✓ | OK |
| Admin-only: admin routes | ✓ | ✓ | OK |

**Verdict:** Access control matches the plan.

---

## PHASE 11 — UX Polish & Deployment ⚠️ Partial

| Item | Plan | Current | Status |
|------|------|---------|--------|
| Loading states | ✓ | Some (e.g. Suspense on login/eligibility); not everywhere | Partial |
| Empty states | ✓ | Dashboard has "No matches"; applications list may need empty state | Partial |
| Error handling | ✓ | Alerts on API errors; no global error boundary | Partial |
| Clear copy | ✓ | Generally good | OK |
| Deployment (Vercel, env, verify) | ✓ | Not documented in repo | Optional |

**Verdict:** Can improve loading/empty/error handling incrementally.

---

## Summary: What’s Correct vs. What’s Missing

### Working as intended

- **Phases 0, 1, 5, 6, 7, 8, 9, 10:** Implemented and aligned with the plan.
- **Phase 2 (entry):** Email entry at `/eligibility`, send magic link, no redirect after submit. Only the **“temporary session + continue without verifying”** part is missing.
- **Phase 3:** Questionnaire and persistence are correct. The **“Verify your email to continue”** screen is missing and only needed if we add the unverified flow.
- **Phase 4:** Verification gate is correct for the current “verify first” flow.

### Gaps (by design choice)

1. **Unverified-user flow (Phase 2 + 3)**  
   - Plan: enter email → verification sent in background → **continue to questionnaire** → after submit show “Verify your email to continue” → block dashboard until verified.  
   - Current: enter email → verification sent → **must click link** → then onboarding → dashboard.  
   - To implement the plan literally we’d need: temporary session/cookie by email, save questionnaire for “pending” user, merge on verification, and “Verify your email” screen after questionnaire.

2. **“Verify your email to continue” after questionnaire (Phase 3.3)**  
   - Only relevant if we implement the unverified flow above.

3. **Incremental save in onboarding (Phase 3)**  
   - Plan: “Save answers incrementally.” Current: one submit at end. Acceptable for MVP; can add per-step save later.

4. **UX polish (Phase 11)**  
   - Loading/empty/error handling can be improved across the app.

---

## Recommended next steps

1. **Decide on Phase 2/3 behaviour**  
   - **Option A:** Keep current flow (verify email first, then onboarding). No code change; document in README/IMPLEMENTATION_REVIEW.  
   - **Option B:** Implement full unverified flow (temporary session, pending profile, “Verify your email” screen, then gate). Requires design (cookie/session key, DB or store for pending data) and a few new routes/components.

2. **Small improvements (no plan change)**  
   - Add loading/empty/error states where missing (dashboard, applications list, forms).  
   - Optionally add a `components/` folder and move shared UI (e.g. cards, buttons) for consistency.

3. **Documentation**  
   - Update README or IMPLEMENTATION_REVIEW with: “Current flow: Land → Eligibility (email) → Check email → Click link → Onboarding → Dashboard.”  
   - Note that “Verify your email to continue” and “unverified session” are not implemented and are optional per plan.

Once you decide on Option A vs. B (and any UX polish priorities), we can implement the chosen changes step by step.
