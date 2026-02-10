# Email flows

There are **two separate** email flows in the app. It’s easy to mix them up.

---

## 1. Auth email (login and eligibility verification)

**Purpose:** Sign the user in or verify email ownership. Prove they own the email address.

**Rate-limit-friendly design:** We send **no email** when the user first enters their email. We only send one auth email **after** they have completed the form and explicitly request verification. That keeps usage to **one email per new user** and avoids hitting Supabase’s 2-emails-per-hour limit during the flow.

### Eligibility flow (new users)

1. User enters email on `/eligibility` → **no email sent**.
2. User completes the questionnaire; we save their profile to `pending_profiles` (keyed by email).
3. User lands on “Verify your email” and clicks **“Send verification code”** → **one email sent** (Supabase OTP).
4. User enters the 6-digit code → we call `verifyOtp` → session created → redirect to `/dashboard`. Protected layout migrates `pending_profiles` → `business_profiles`.

So: one auth email per new user, sent only when they choose to verify and see their schemes.

### Login (returning users)

**Where:** `/login` → user enters email → clicks “Email me a code” → Supabase sends one email.

**What the user does:** Enter the 6-digit code from the email on the login page; we call `verifyOtp` and redirect to the dashboard. The email can also contain a magic link (if the template includes it); clicking the link goes to `/auth/callback?code=...&next=...`, which exchanges the code for a session and redirects.

**Important:** The link in the email (if used) must point at your app’s URL. We use:

- **`NEXT_PUBLIC_APP_URL`** in env (if set) as the base for `emailRedirectTo`.
- If not set, we use `window.location.origin` (fine for local dev; in production set `NEXT_PUBLIC_APP_URL` to your real site URL).

**Rate limits:** Supabase limits auth emails (e.g. 2 per hour with built-in email). The app shows a friendly message when the limit is hit. To raise limits, use custom SMTP and/or see Supabase Dashboard → Authentication → Rate Limits.

---

## 2. Eligibility summary email

**Purpose:** Send the user a summary of their scheme matches (after they’re already logged in). Not for confirming email or logging in.

**Where:** `POST /api/send-email` with `{ type: "eligibility_summary", to?: "optional@email.com" }`. If `to` is omitted, we send to the logged-in user’s email.

**Current state:** The API exists and works. There is **no UI yet** that calls it (no “Email me my summary” or eligibility-check email input on the dashboard). So:

- The **only** email input on the login page is for **auth** (step 1 above), not for “send my eligibility here.”
- A future “Email me my summary” (or “Send results to this email”) on the dashboard would call this API; that would be a separate, optional feature.

**Summary:** Eligibility summary is a separate feature. Login email = auth only. Eligibility email = optional “send my results,” not yet wired in the UI.
