import { createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { matchSchemes } from "@/lib/eligibility/engine";
import { deriveProfileFromStep1 } from "@/lib/eligibility/derive-profile";
import type { BusinessProfile, Scheme } from "@/lib/db/types";
import type { Step1FormData } from "@/lib/eligibility/questions";

/** POST: get scheme matches for step1 answers (no auth). Body: step1 form data. */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const step1 = body as Partial<Step1FormData>;
  const profile = deriveProfileFromStep1(step1) as BusinessProfile;

  const db = createServiceRoleClient();
  const { data: schemes, error } = await db.from("schemes").select("*");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results = matchSchemes(profile, (schemes ?? []) as Scheme[]);

  return NextResponse.json({
    matches: results.map((r) => ({
      scheme: r.scheme,
      score: r.score,
      missingRequirements: r.missingRequirements,
    })),
    derivedProfile: {
      business_type: profile.business_type,
      industry: profile.industry,
      state: profile.state,
    },
  });
}
