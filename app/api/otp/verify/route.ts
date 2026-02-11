import { createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  next: z.string().optional(),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { email: rawEmail, code, next = "/dashboard" } = parsed.data;
  const email = rawEmail.trim().toLowerCase();

  const db = createServiceRoleClient();

  const { data: row, error: findError } = await db
    .from("otps")
    .select("id")
    .eq("email", email)
    .eq("code", code)
    .gte("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (findError || !row) {
    return NextResponse.json(
      { error: "Invalid or expired code. Please request a new one." },
      { status: 400 }
    );
  }

  await db.from("otps").delete().eq("id", row.id);

  const supabase = createServiceRoleClient();
  let baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (request.headers.get("x-forwarded-host")
      ? `https://${request.headers.get("x-forwarded-host")}`
      : "http://localhost:3000");
  // Use http for localhost (dev server has no SSL; https://localhost causes ERR_SSL_PROTOCOL_ERROR)
  if (baseUrl.startsWith("https://localhost") || baseUrl.startsWith("https://127.0.0.1")) {
    baseUrl = baseUrl.replace(/^https:/, "http:");
  }
  const redirectTo = `${baseUrl}/auth/callback?next=${encodeURIComponent(next)}`;

  const { error: createError } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
  });
  // "already registered" / "already been registered" / "already exists" = user exists; continue to generate magic link
  const isExistingUser =
    /already (been )?registered|already exists/i.test(createError?.message ?? "");
  if (createError && !isExistingUser) {
    return NextResponse.json({ error: createError.message }, { status: 500 });
  }

  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo },
  });

  if (linkError) {
    return NextResponse.json(
      { error: linkError.message },
      { status: 500 }
    );
  }

  const redirectUrl =
    (linkData as { properties?: { action_link?: string } })?.properties?.action_link ??
    (linkData as { action_link?: string })?.action_link ??
    (linkData as { data?: { action_link?: string } })?.data?.action_link;

  if (!redirectUrl) {
    return NextResponse.json(
      { error: "Could not generate sign-in link" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, redirect_url: redirectUrl });
}
