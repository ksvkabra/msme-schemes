import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const derivedSchema = z.object({
  business_type: z.enum(["micro", "small", "medium", "startup"]),
  industry: z.string().min(1),
  state: z.string().min(1),
  turnover_range: z.string().min(1),
  company_age: z.string().min(1),
  funding_goal: z.enum(["loan", "subsidy", "grant", "any"]).optional(),
});

/** Payload: optional email (required when not logged in); entityType + startup/msme + derived. Optional step2. */
const newBodySchema = z.object({
  email: z.string().email().optional(),
  entityType: z.enum(["startup", "msme"]).optional(),
  startup: z.record(z.string(), z.unknown()).optional(),
  msme: z.record(z.string(), z.unknown()).optional(),
  step2: z.record(z.string(), z.unknown()).optional(),
  derived: derivedSchema,
});

/** Legacy payload: flat profile fields. */
const legacyBodySchema = z.object({
  email: z.string().email(),
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

  const body = await request.json();
  const newParsed = newBodySchema.safeParse(body);
  const legacyParsed = legacyBodySchema.safeParse(body);

  let payload: {
    email: string | null;
    business_type: "micro" | "small" | "medium" | "startup";
    industry: string;
    state: string;
    turnover_range: string;
    company_age: string;
    funding_goal: string | null;
    entity_type?: "startup" | "msme";
    questionnaire_responses?: Record<string, unknown>;
    step2_responses?: Record<string, unknown>;
  };

  if (newParsed.success) {
    const d = newParsed.data.derived;
    const data = newParsed.data;
    const questionnaireResponses =
      data.entityType === "startup"
        ? (data.startup as Record<string, unknown>)
        : data.entityType === "msme"
          ? (data.msme as Record<string, unknown>)
          : undefined;
    const emailVal = data.email?.trim().toLowerCase() ?? user?.email?.trim().toLowerCase() ?? null;
    if (!user && !emailVal) {
      return NextResponse.json(
        { error: "Email is required when not logged in." },
        { status: 400 }
      );
    }
    payload = {
      email: emailVal ?? null,
      business_type: d.business_type,
      industry: d.industry,
      state: d.state,
      turnover_range: d.turnover_range,
      company_age: d.company_age,
      funding_goal: d.funding_goal ?? null,
      entity_type: data.entityType ?? undefined,
      questionnaire_responses: questionnaireResponses ?? undefined,
      step2_responses: data.step2 ? (data.step2 as Record<string, unknown>) : undefined,
    };
  } else if (legacyParsed.success) {
    const p = legacyParsed.data;
    payload = {
      email: p.email.trim().toLowerCase(),
      business_type: p.business_type,
      industry: p.industry,
      state: p.state,
      turnover_range: p.turnover_range,
      company_age: p.company_age,
      funding_goal: p.funding_goal ?? null,
    };
  } else {
    return NextResponse.json(
      {
        error: "Invalid input",
        details: newParsed.error?.flatten() ?? legacyParsed.error?.flatten(),
      },
      { status: 400 }
    );
  }

  // Logged-in: upsert business_profiles (single eligibility + onboarding flow)
  if (user) {
    const profileRow: Record<string, unknown> = {
      user_id: user.id,
      business_type: payload.business_type,
      industry: payload.industry,
      state: payload.state,
      turnover_range: payload.turnover_range,
      company_age: payload.company_age,
      funding_goal: payload.funding_goal,
    };
    if (payload.entity_type != null) profileRow.entity_type = payload.entity_type;
    if (payload.questionnaire_responses != null) profileRow.questionnaire_responses = payload.questionnaire_responses;
    if (payload.step2_responses != null) profileRow.step2_responses = payload.step2_responses;
    const { error: profileError } = await supabase.from("business_profiles").upsert(profileRow, {
      onConflict: "user_id",
    });
    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  // Not logged in: save to pending_profiles (requires email)
  if (!payload.email) {
    return NextResponse.json(
      { error: "Email is required when not logged in." },
      { status: 400 }
    );
  }
  const db = createServiceRoleClient();
  const row: Record<string, unknown> = {
    email: payload.email,
    business_type: payload.business_type,
    industry: payload.industry,
    state: payload.state,
    turnover_range: payload.turnover_range,
    company_age: payload.company_age,
    funding_goal: payload.funding_goal,
  };
  if (payload.entity_type != null) row.entity_type = payload.entity_type;
  if (payload.questionnaire_responses != null) row.questionnaire_responses = payload.questionnaire_responses;
  if (payload.step2_responses != null) row.step2_responses = payload.step2_responses;
  const { error } = await db.from("pending_profiles").upsert(row, {
    onConflict: "email",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
