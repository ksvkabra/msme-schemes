# Supabase auth limits and login options

## Rate limits (official)

| What | Endpoints | Limit | Customizable? |
|------|-----------|--------|----------------|
| **Emails (signup / recover / email change)** | `/auth/v1/signup`, `/auth/v1/recover`, `/auth/v1/user` | **2 emails per hour** (combined) | Only with **custom SMTP** |
| **OTP (magic link + email code)** | `/auth/v1/otp` | **30 per hour** | Yes (Dashboard → Auth → Rate Limits) |
| Per-user (same email/phone) | — | 1 request per **60 seconds** | Yes for OTP |

`signInWithOtp({ email })` uses the **OTP** endpoint, so magic link and 6-digit code both count under **30/hour**, not the 2/hour email cap. The 2/hour cap applies to signup confirmation, password reset, and “change email” flows.

## Options if you hit limits

### 1. Use email OTP (6-digit code) instead of magic link

- **Same** `signInWithOtp` API; you only change the **Magic Link** email template in Dashboard → Auth → Email Templates to show `{{ .Token }}` (6-digit code) instead of a link.
- User enters the code on your app; you call `verifyOtp({ email, token, type: 'email' })` to create the session.
- Still uses the **30/hour** OTP limit (same as magic link), but avoids link-in-email issues and can feel more reliable.

### 2. Custom SMTP (recommended for production)

- Configure your own SMTP (Resend, SendGrid, AWS SES, etc.) in **Dashboard → Project Settings → Auth → SMTP**.
- After that, **Auth → Rate Limits** lets you increase the “email sent” limit (the 2/hour one).
- You keep using magic link or OTP as you prefer.

### 3. Send Email Hook

- Use **Auth Hooks → Send Email** to replace Supabase’s built-in sending with your own provider.
- Full control over when and how auth emails are sent; no dependency on Supabase’s limits.

### 4. Raise OTP limit (when using `signInWithOtp`)

- If the bottleneck is OTP (e.g. many logins), increase **rate_limit_otp** in **Auth → Rate Limits** or via [Management API](https://supabase.com/docs/guides/auth/rate-limits).

## This project

- **Login** and **eligibility** flows use `signInWithOtp` (magic link by default).
- They are subject to the **30 OTPs/hour** limit and the **60-second** per-user cooldown.
- **Login** supports both: after requesting sign-in, the user can enter a **6-digit code** (if your template sends it) or click the magic link.

### Enabling 6-digit code in the email

To send a code instead of (or in addition to) the link:

1. Open **Supabase Dashboard** → **Authentication** → **Email Templates**.
2. Edit the **Magic Link** template.
3. Include the one-time code in the body, e.g.  
   `Your sign-in code: {{ .Token }}`  
   (You can keep the link as well so both code and link work.)
4. Save. New sign-in emails will contain the 6-digit code; users can enter it on the login “Check your email” screen.
