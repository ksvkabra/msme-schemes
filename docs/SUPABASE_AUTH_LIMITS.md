# Supabase auth limits and login options

## Rate limits (official)

| What | Endpoints | Limit | Customizable? |
|------|-----------|--------|----------------|
| **Emails sent (all auth emails)** | Signup, recover, email change, **and magic link / OTP emails** | **2 per hour** (combined, when using Supabase’s built-in email) | Only with **custom SMTP** |
| **OTP endpoint** | `/auth/v1/otp` | 30/hour in docs; in practice **built-in email is often 2/hour** | With custom SMTP you can raise “email sent” |
| Per-user (same email/phone) | — | 1 request per **60 seconds** | Yes for OTP |

**Why you see “rate limit” after one try:** On hosted Supabase with **default (built-in) email**, all auth emails—including those from `signInWithOtp` (magic link or code)—share the **2 per hour** limit. So one request can fail if two emails were already sent in that hour (e.g. eligibility + login, or two tests). The only way to increase this is **custom SMTP** (see below).

## Options if you hit limits

### 1. Use email OTP (6-digit code) instead of magic link

- **Same** `signInWithOtp` API; you only change the **Magic Link** email template in Dashboard → Auth → Email Templates to show `{{ .Token }}` (6-digit code) instead of a link.
- User enters the code on your app; you call `verifyOtp({ email, token, type: 'email' })` to create the session.
- Still uses the **30/hour** OTP limit (same as magic link), but avoids link-in-email issues and can feel more reliable.

### 2. Custom SMTP (fix for “rate limit after one try”) — recommended

- With **built-in** Supabase email, you are limited to **2 auth emails per hour** for the whole project (including `signInWithOtp`). That’s why you can hit the limit after a single attempt (e.g. if two were already sent).
- **Fix:** Configure your own SMTP in **Dashboard → Project Settings → Auth → SMTP** (e.g. [Resend](https://resend.com), SendGrid, AWS SES). After SMTP is enabled, **Dashboard → Authentication → Rate Limits** lets you increase **“Emails sent”** (e.g. to 10, 30, or more per hour).
- You keep using `signInWithOtp` and magic link or 6-digit code as you prefer; only the delivery and limit change.

### 3. Send Email Hook

- Use **Auth Hooks → Send Email** to replace Supabase’s built-in sending with your own provider.
- Full control over when and how auth emails are sent; no dependency on Supabase’s limits.

### 4. Raise OTP limit (when using `signInWithOtp`)

- If the bottleneck is OTP (e.g. many logins), increase **rate_limit_otp** in **Auth → Rate Limits** or via [Management API](https://supabase.com/docs/guides/auth/rate-limits).

## This project – OTP-only (no magic link)

**One approach for sending:** we use **`signInWithOtp({ email })`** everywhere (login and eligibility). There is no separate “magic link” API; Supabase has a single OTP endpoint that sends one email. What’s inside that email is controlled only by the **Magic Link** email template in the Supabase dashboard:

- **Default template** → email contains a **link** (magic link). User clicks → redirects to `/auth/callback?code=...` → we call `exchangeCodeForSession(code)`.
- **If you add `{{ .Token }}` to the template** → email can also (or only) show a **6-digit code**. User can enter it on the login page → we call `verifyOtp({ email, token, type: 'email' })`.

The email contains **only the 6-digit code** (no link). User enters it on the app; we call `verifyOtp({ email, token, type: 'email' })`. `/auth/callback` is kept for backward compatibility and still migrates `pending_profiles`.

- **Login:** User enters email → clicks “Email me a code” → we send OTP → user enters 6-digit code on login page → signed in (verifyOtp).
- **Eligibility:** User enters email (no email sent) → completes form → we save to `pending_profiles` → user sees “Verify your email to see your schemes” → user clicks “Send verification code” → we send OTP once → user enters 6-digit code on same page → verifyOtp → redirect to dashboard. Pending profile is migrated in protected layout (or via callback for magic-link clicks). This way we use **one email per new user** and avoid sending at email entry, which helps stay within the 2/hour limit.

### Without Send Email Hook

If you are not using the Send Email Hook:

1. Open **Supabase Dashboard** → **Authentication** → **Email Templates**.
2. Edit the **Magic Link** template.
3. Include the one-time code in the body, e.g.  
   `Your sign-in code: {{ .Token }}`  
   (You can keep the link as well so both code and link work.)
4. Save. New sign-in emails will contain the 6-digit code; users can enter it on the login “Check your email” screen.

## Troubleshooting: “Rate limit” after one try

1. **Double submit** – The app now guards against duplicate sends (ref). If you still see it, wait 60 seconds and try again (per-user cooldown).
2. **2 emails already sent this hour** – With built-in email, the limit is 2/hour for the whole project. If you used eligibility and then login, or ran tests, the next request will be blocked. **Solution:** Set up [Custom SMTP](#2-custom-smtp-fix-for-rate-limit-after-one-try--recommended) and raise the “Emails sent” limit in Auth → Rate Limits.
3. **Check limits** – In **Supabase Dashboard → Authentication → Rate Limits** you can see (and, with custom SMTP, change) the “Emails sent” value.
