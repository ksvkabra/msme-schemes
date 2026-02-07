import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { NextResponse } from "next/server";
import type { EligibilityRules } from "@/lib/db/types";

function parseEligibilityRules(raw: unknown): EligibilityRules {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const rules: EligibilityRules = {};
  if (Array.isArray(o.business_types)) rules.business_types = o.business_types as ("micro" | "small" | "medium" | "startup")[];
  if (Array.isArray(o.industries)) rules.industries = o.industries as string[];
  if (Array.isArray(o.states)) rules.states = o.states as string[];
  if (typeof o.turnover_min === "number") rules.turnover_min = o.turnover_min;
  if (typeof o.turnover_max === "number") rules.turnover_max = o.turnover_max;
  if (typeof o.company_age_min_years === "number") rules.company_age_min_years = o.company_age_min_years;
  if (typeof o.company_age_max_years === "number") rules.company_age_max_years = o.company_age_max_years;
  if (Array.isArray(o.funding_types)) rules.funding_types = o.funding_types as ("loan" | "subsidy" | "grant")[];
  return rules;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Body required" }, { status: 400 });
  }
  const b = body as Record<string, unknown>;
  const name = typeof b.name === "string" ? b.name.trim() : "";
  const type = typeof b.type === "string" ? b.type.trim() : "";
  const benefit_summary = typeof b.benefit_summary === "string" ? b.benefit_summary.trim() : "";
  if (!name || !type) {
    return NextResponse.json({ error: "name and type required" }, { status: 400 });
  }

  const key_benefit_display = typeof b.key_benefit_display === "string" ? b.key_benefit_display.trim() || null : null;
  const estimated_timeline = typeof b.estimated_timeline === "string" ? b.estimated_timeline.trim() || null : null;
  const required_documents = Array.isArray(b.required_documents)
    ? (b.required_documents as string[]).filter((x) => typeof x === "string")
    : [];
  const states_applicable = Array.isArray(b.states_applicable)
    ? (b.states_applicable as string[]).filter((x) => typeof x === "string")
    : null;
  const eligibility_rules = parseEligibilityRules(b.eligibility_rules);

  const db = createServiceRoleClient();
  const { data, error } = await db
    .from("schemes")
    .insert({
      name,
      type,
      benefit_summary: benefit_summary || null,
      key_benefit_display,
      required_documents,
      estimated_timeline,
      states_applicable,
      eligibility_rules,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ id: data.id });
}
