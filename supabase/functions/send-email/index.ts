/* eslint-disable @typescript-eslint/ban-ts-comment -- Deno Edge Function; URL/npm imports and Deno globals are resolved at runtime. */
// @ts-nocheck
// Supabase Auth "Send Email" hook: receive auth email payload from Supabase,
// verify webhook, then send the email via Resend. Must respond within 5s.
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") ?? "");
const fromEmail =
  Deno.env.get("RESEND_FROM_EMAIL") ?? "onboarding@resend.dev";
// Same secret as in Dashboard → Authentication → Hooks (Send Email). Set via: supabase secrets set SEND_EMAIL_HOOK_SECRET=...
const hookSecretRaw = Deno.env.get("SEND_EMAIL_HOOK_SECRET") ?? "";
const hookSecret = hookSecretRaw.replace(/^v1,whsec_/, "");

/** Supabase requires the hook to respond within 5 seconds. */
const HOOK_TIMEOUT_MS = 4000;

function timeoutResponse(status: number, message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

interface HookPayload {
  user: { email?: string; email_new?: string };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
    token_new: string;
    token_hash_new: string;
    old_email?: string;
    old_phone?: string;
  };
}

// OTP-only: we send only the 6-digit code. User enters it on the app (login page).
function htmlEmail(token: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Your sign-in code</title></head>
<body style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
  <h2 style="margin-top: 0;">Sign in</h2>
  <p>Use this one-time code to sign in. No password needed.</p>
  <p style="margin: 16px 0 8px;">Your 6-digit code:</p>
  <p style="font-size: 24px; letter-spacing: 4px; font-weight: 600;">${token}</p>
  <p style="color: #6b7280; font-size: 14px;">If you didn't request this, you can ignore this email.</p>
</body>
</html>
`.trim();
}

async function handleHook(req: Request): Promise<Response> {
  const payload = await req.text();
  const headers = Object.fromEntries(req.headers.entries());
  const wh = new Webhook(hookSecret);

  let data: HookPayload;
  try {
    data = wh.verify(payload, headers) as HookPayload;
  } catch (e) {
    console.error("Webhook verification failed:", e);
    return new Response(
      JSON.stringify({ error: "Invalid signature" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const { user, email_data } = data;
  const to = user.email ?? user.email_new;
  if (!to) {
    return new Response(
      JSON.stringify({ error: "No recipient email" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { token, token_hash, token_new, token_hash_new } = email_data;

  const emailsToSend: { to: string; token: string }[] = [];
  if (token_hash && token) {
    emailsToSend.push({ to, token });
  }
  if (email_data.old_email && token_hash_new && token_new && to !== email_data.old_email) {
    emailsToSend.push({ to: email_data.old_email, token: token_new });
  }
  if (emailsToSend.length === 0) {
    emailsToSend.push({ to, token: token_new || token });
  }

  const subject = "Your sign-in code";

  for (const { to: recipient, token: t } of emailsToSend) {
    const html = htmlEmail(t);

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [recipient],
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  return new Response(JSON.stringify({}), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const timeoutPromise = new Promise<Response>((_, reject) => {
    setTimeout(() => reject(new Error("Hook timeout")), HOOK_TIMEOUT_MS);
  });

  try {
    return await Promise.race([handleHook(req), timeoutPromise]);
  } catch (e) {
    if (e instanceof Error && e.message === "Hook timeout") {
      console.error("Send email hook exceeded", HOOK_TIMEOUT_MS, "ms");
      return timeoutResponse(503, "Hook timeout; try again.");
    }
    throw e;
  }
});
