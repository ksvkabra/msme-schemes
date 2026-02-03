import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  business_type: z.enum(["micro", "small", "medium", "startup"]),
  industry: z.string().min(1),
  state: z.string().min(1),
  turnover_range: z.string().min(1),
  company_age: z.string().min(1),
  funding_goal: z.enum(["loan", "subsidy", "grant", "any"]).optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("business_profiles").upsert(
    {
      user_id: user.id,
      business_type: parsed.data.business_type,
      industry: parsed.data.industry,
      state: parsed.data.state,
      turnover_range: parsed.data.turnover_range,
      company_age: parsed.data.company_age,
      funding_goal: parsed.data.funding_goal ?? null,
    },
    { onConflict: "user_id" }
  );

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
