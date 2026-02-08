import { createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  email: z.string().email(),
  business_type: z.enum(["micro", "small", "medium", "startup"]),
  industry: z.string().min(1),
  state: z.string().min(1),
  turnover_range: z.string().min(1),
  company_age: z.string().min(1),
  funding_goal: z.enum(["loan", "subsidy", "grant", "any"]).optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const db = createServiceRoleClient();
  const { error } = await db.from("pending_profiles").upsert(
    {
      email: parsed.data.email.trim().toLowerCase(),
      business_type: parsed.data.business_type,
      industry: parsed.data.industry,
      state: parsed.data.state,
      turnover_range: parsed.data.turnover_range,
      company_age: parsed.data.company_age,
      funding_goal: parsed.data.funding_goal ?? null,
    },
    { onConflict: "email" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
