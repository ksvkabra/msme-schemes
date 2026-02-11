import { createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  email: z.string().email(),
});

/**
 * Check if an email is already registered (exists in auth.users).
 * Used on the eligibility form: if exists, redirect user to verification → login → dashboard.
 */
export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  const email = parsed.data.email.trim().toLowerCase();

  const supabase = createServiceRoleClient();
  const {
    data: { users },
    error,
  } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });

  if (error) {
    return NextResponse.json(
      { error: "Could not check email. Please try again." },
      { status: 500 }
    );
  }

  const exists =
    users?.some(
      (u) => u.email?.trim().toLowerCase() === email
    ) ?? false;

  return NextResponse.json({ exists });
}
