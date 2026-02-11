# Auth and OTP in this project

## How sign-in works (no Supabase auth emails)

We do **not** use Supabase to send auth emails (no `signInWithOtp`, no magic link email from Supabase, no Send Email Hook). That avoids Supabase’s 2-emails-per-hour limit and keeps the flow simple.

- **OTP storage:** Table `otps` (email, code, expires_at). See migration `20250212000000_otps.sql`.
- **Send code:** `POST /api/otp/send` — generates 6-digit code, stores in `otps`, sends email via **Resend** from the Next.js API.
- **Verify code:** `POST /api/otp/verify` — validates code from `otps`, then uses Supabase Auth **admin** (`createUser` if needed, `generateLink` type magiclink) to get a sign-in link. Client redirects the user to that link; they hit `/auth/callback` and get a session.

So Supabase Auth is only used for **sessions** (cookies, protected routes). All **email sending** is done by our app with Resend. Rate limits are whatever Resend allows; we also apply a 1-minute cooldown per email in `/api/otp/send`.

## Resend: “Only send to your own email” (no domain yet)

Resend’s free tier only allows sending **to your account email** until you [verify a domain](https://resend.com/domains). For MVP without a domain:

1. **Use `RESEND_DEV_TO`**  
   In `.env` set:
   ```bash
   RESEND_DEV_TO=work.keshavkabra@gmail.com
   ```
   (Use the same email as your Resend account.) The app will then **only** send OTP emails to that address. If someone else enters a different email, they see a friendly message asking them to use the test address or to wait until you verify a domain. You can test the full flow with your own email.

2. **When you have a domain**  
   Verify it at resend.com/domains, set `RESEND_FROM_EMAIL` to an address on that domain (e.g. `noreply@yourdomain.com`), and remove `RESEND_DEV_TO`. Then you can send to any recipient.

3. **Alternative: Gmail SMTP for testing**  
   If you want to send to other addresses before having a domain, you can use Gmail SMTP (e.g. with Nodemailer) in development. That requires a Gmail App Password and code changes to use SMTP when `RESEND_DEV_TO` is not set. For most MVPs, using `RESEND_DEV_TO` with your own email is enough.

## Troubleshooting

- **"Please wait a minute"** — One OTP per email per 60 seconds. Wait and try again.
- **"Invalid or expired code"** — Codes expire after 15 minutes. Request a new one.
- **Email not received** — Check `RESEND_API_KEY` and `RESEND_FROM_EMAIL`; check Resend dashboard for delivery/errors.
