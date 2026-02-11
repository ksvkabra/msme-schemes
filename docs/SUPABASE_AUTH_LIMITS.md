# Auth and OTP in this project

## How sign-in works (no Supabase auth emails)

We do **not** use Supabase to send auth emails (no `signInWithOtp`, no magic link email from Supabase, no Send Email Hook). That avoids Supabase’s 2-emails-per-hour limit and keeps the flow simple.

- **OTP storage:** Table `otps` (email, code, expires_at). See migration `20250212000000_otps.sql`.
- **Send code:** `POST /api/otp/send` — generates 6-digit code, stores in `otps`, sends email via **Resend** from the Next.js API.
- **Verify code:** `POST /api/otp/verify` — validates code from `otps`, then uses Supabase Auth **admin** (`createUser` if needed, `generateLink` type magiclink) to get a sign-in link. Client redirects the user to that link; they hit `/auth/callback` and get a session.

So Supabase Auth is only used for **sessions** (cookies, protected routes). All **email sending** is done by our app with Resend. Rate limits are whatever Resend allows; we also apply a 1-minute cooldown per email in `/api/otp/send`.

## Troubleshooting

- **"Please wait a minute"** — One OTP per email per 60 seconds. Wait and try again.
- **"Invalid or expired code"** — Codes expire after 15 minutes. Request a new one.
- **Email not received** — Check `RESEND_API_KEY` and `RESEND_FROM_EMAIL`; check Resend dashboard for delivery/errors.
