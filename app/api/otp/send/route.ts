import { createServiceRoleClient } from "@/lib/supabase/server";
import { sendEmail, otpEmailHtml } from "@/lib/email/send";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({ email: z.string().email() });

const OTP_EXPIRY_MINUTES = 15;
const RATE_LIMIT_SECONDS = 60;

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  const email = parsed.data.email.trim().toLowerCase();

  const db = createServiceRoleClient();

  // Rate limit: one OTP per email per RATE_LIMIT_SECONDS
  const { data: recent } = await db
    .from("otps")
    .select("created_at")
    .eq("email", email)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (recent?.created_at) {
    const created = new Date(recent.created_at).getTime();
    if (Date.now() - created < RATE_LIMIT_SECONDS * 1000) {
      return NextResponse.json(
        { error: "Please wait a minute before requesting another code." },
        { status: 429 }
      );
    }
  }

  const code = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  const { error: insertError } = await db.from("otps").insert({
    email,
    code,
    expires_at: expiresAt.toISOString(),
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">${otpEmailHtml(code)}</body></html>`;
  const result = await sendEmail({
    to: email,
    subject: "Your sign-in code",
    html,
  });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error ?? "Failed to send email" },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
