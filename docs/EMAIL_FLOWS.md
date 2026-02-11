# Email flows

## 1. Sign-in / verification (OTP via Resend)

We use a **simple custom OTP flow**: no Supabase auth emails, no magic links, no Edge Functions.

- **Storage:** OTPs are stored in the `otps` table (email, code, expires_at). Only the backend (service role) can read/write.
- **Sending:** When the user requests a code (login or eligibility verify step), `POST /api/otp/send` generates a 6-digit code, saves it to `otps`, and sends the email via **Resend** from the Next.js app.
- **Verification:** When the user submits the code, `POST /api/otp/verify` checks the code against `otps`, then uses Supabase Auth **admin** to create the user (if needed) and generate a magic link. The API returns the link; the client redirects the user to it so they land on `/auth/callback` with a session. No email is sent by Supabase.

**Flow:**

1. **Login:** User enters email → "Email me a code" → `POST /api/otp/send` → Resend sends 6-digit code. User enters code → `POST /api/otp/verify` → redirect to Supabase magic link → `/auth/callback` → dashboard.
2. **Eligibility:** User enters email (no email) → completes form → data saved to `pending_profiles` → "Verify your email" → "Send verification code" → `POST /api/otp/send` → Resend sends code. User enters code → `POST /api/otp/verify` → redirect → callback migrates `pending_profiles` → dashboard.

**Env:** `RESEND_API_KEY` and optionally `RESEND_FROM_EMAIL`. No Supabase Auth hook or SMTP needed.

---

## 2. Eligibility summary email

**Purpose:** Send the user a summary of their scheme matches (after they’re already logged in).

**Where:** `POST /api/send-email` with `{ type: "eligibility_summary", to?: "optional@email.com" }`. Uses Resend. No UI wired yet.
