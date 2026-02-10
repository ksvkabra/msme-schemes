import { createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { matchSchemes } from "@/lib/eligibility/engine";
import {
  deriveStartupProfile,
  deriveMSMEProfile,
  deriveProfileFromStep1,
} from "@/lib/eligibility/derive-profile";
import type { BusinessProfile, Scheme } from "@/lib/db/types";
import type { Step1FormData, StartupFormData, MSMEFormData } from "@/lib/eligibility/questions";

/** POST: get scheme matches. Body: { entityType, startup?, msme? } (new) or legacy step1 form data. */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const b = body as {
    entityType?: "startup" | "msme";
    startup?: Record<string, unknown>;
    msme?: Record<string, unknown>;
  } & Partial<Step1FormData>;

  let profile: BusinessProfile;

  if (b.entityType === "startup" && b.startup) {
    profile = deriveStartupProfile(b.startup as Partial<StartupFormData>) as BusinessProfile;
  } else if (b.entityType === "msme" && b.msme) {
    profile = deriveMSMEProfile(b.msme as Partial<MSMEFormData>) as BusinessProfile;
  } else {
    // Legacy: step1 form data
    profile = deriveProfileFromStep1(b) as BusinessProfile;
  }

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
