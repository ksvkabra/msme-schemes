import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  business_type: z.enum(["micro", "small", "medium", "startup"]),
  industry: z.string().min(1),
  state: z.string().min(1),
  turnover_range: z.string().min(1),
  company_age: z.string().min(1),
  funding_goal: z.enum(["loan", "subsidy", "grant", "any"]).optional(),
  email: z.string().email().optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  if (user) {
    const { error } = await supabase.from("business_profiles").upsert(
      {
        user_id: user.id,
        business_type: data.business_type,
        industry: data.industry,
        state: data.state,
        turnover_range: data.turnover_range,
        company_age: data.company_age,
        funding_goal: data.funding_goal ?? null,
      },
      { onConflict: "user_id" }
    );
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  // No user (auth disabled): save to pending_profiles so the form doesn't error
  const db = createServiceRoleClient();
  const email =
    data.email?.trim().toLowerCase() ??
    `onboarding-${crypto.randomUUID().slice(0, 8)}@temp.local`;
  const { error } = await db.from("pending_profiles").upsert(
    {
      email,
      business_type: data.business_type,
      industry: data.industry,
      state: data.state,
      turnover_range: data.turnover_range,
      company_age: data.company_age,
      funding_goal: data.funding_goal ?? null,
    },
    { onConflict: "email" }
  );
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
