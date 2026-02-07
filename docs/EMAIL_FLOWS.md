# Email flows

There are **two separate** email flows in the app. It’s easy to mix them up.

---

## 1. Confirm-your-email (login / auth)

**Purpose:** Sign the user in. Prove they own the email address.

**Where:** `/login` → user enters email → Supabase sends one email.

**What the user does:** Click the “Confirm your mail” link in the email. That link goes to `/auth/callback?code=...&next=...`, which exchanges the code for a session and redirects to `next` (e.g. dashboard). There is no 6-digit code in the email—link only.

**Important:** The link in the email must point at your app’s URL. We use:

- **`NEXT_PUBLIC_APP_URL`** in env (if set) as the base for `emailRedirectTo`.
- If not set, we use `window.location.origin` (fine for local dev, but in production you should set `NEXT_PUBLIC_APP_URL` to your real site URL so the link is not localhost).

**Summary:** One email for auth with a sign-in link only. User clicks the link to sign in. Set `NEXT_PUBLIC_APP_URL` in production so the link works.

---

## 2. Eligibility summary email

**Purpose:** Send the user a summary of their scheme matches (after they’re already logged in). Not for confirming email or logging in.

**Where:** `POST /api/send-email` with `{ type: "eligibility_summary", to?: "optional@email.com" }`. If `to` is omitted, we send to the logged-in user’s email.

**Current state:** The API exists and works. There is **no UI yet** that calls it (no “Email me my summary” or eligibility-check email input on the dashboard). So:

- The **only** email input on the login page is for **auth** (step 1 above), not for “send my eligibility here.”
- A future “Email me my summary” (or “Send results to this email”) on the dashboard would call this API; that would be a separate, optional feature.

**Summary:** Eligibility summary is a separate feature. Login email = auth only. Eligibility email = optional “send my results,” not yet wired in the UI.
