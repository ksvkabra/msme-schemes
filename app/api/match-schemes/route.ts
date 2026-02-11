import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { matchSchemes } from "@/lib/eligibility/engine";
import type { BusinessProfile, Scheme } from "@/lib/db/types";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("business_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json(
      { error: "Business profile not found. Complete eligibility first." },
      { status: 404 }
    );
  }

  const { data: schemes, error: schemesError } = await supabase
    .from("schemes")
    .select("*");

  if (schemesError) {
    return NextResponse.json(
      { error: schemesError.message },
      { status: 500 }
    );
  }

  const results = matchSchemes(
    profile as unknown as BusinessProfile,
    (schemes ?? []) as Scheme[]
  );

  // Upsert user_scheme_matches for this user (replace existing)
  const toInsert = results.map((r) => ({
    user_id: user.id,
    scheme_id: r.scheme.id,
    match_score: r.score,
    missing_requirements: r.missingRequirements,
  }));

  await supabase.from("user_scheme_matches").delete().eq("user_id", user.id);
  if (toInsert.length > 0) {
    await supabase.from("user_scheme_matches").insert(toInsert);
  }

  return NextResponse.json({
    matches: results.map((r) => ({
      scheme: r.scheme,
      score: r.score,
      missingRequirements: r.missingRequirements,
    })),
  });
}
