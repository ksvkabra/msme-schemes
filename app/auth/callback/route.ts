import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = url.searchParams.get("next") ?? "/dashboard";
  const code = url.searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data: { user }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
    if (!sessionError && user?.email) {
      const db = createServiceRoleClient();
      const email = user.email.trim().toLowerCase();
      const { data: pending } = await db
        .from("pending_profiles")
        .select("business_type, industry, state, turnover_range, company_age, funding_goal, entity_type, questionnaire_responses, step2_responses")
        .eq("email", email)
        .single();
      if (pending) {
        await db.from("business_profiles").upsert(
          {
            user_id: user.id,
            business_type: pending.business_type,
            industry: pending.industry,
            state: pending.state,
            turnover_range: pending.turnover_range,
            company_age: pending.company_age,
            funding_goal: pending.funding_goal ?? null,
            entity_type: pending.entity_type ?? null,
            questionnaire_responses: pending.questionnaire_responses ?? {},
            step2_responses: pending.step2_responses ?? {},
          },
          { onConflict: "user_id" }
        );
        await db.from("pending_profiles").delete().eq("email", email);
      }
    }
  }

  const redirectUrl = new URL(next, url.origin);
  return NextResponse.redirect(redirectUrl);
}
