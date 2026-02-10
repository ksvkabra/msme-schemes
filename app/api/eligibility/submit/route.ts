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

/** New payload: email + entityType + startup/msme flow data + derived profile. Optional step2. */
const newBodySchema = z.object({
  email: z.string().email(),
  entityType: z.enum(["startup", "msme"]).optional(),
  startup: z.record(z.string(), z.unknown()).optional(),
  msme: z.record(z.string(), z.unknown()).optional(),
  step1: z.record(z.string(), z.unknown()).optional(),
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
  const body = await request.json();
  const newParsed = newBodySchema.safeParse(body);
  const legacyParsed = legacyBodySchema.safeParse(body);

  let payload: {
    email: string;
    business_type: "micro" | "small" | "medium" | "startup";
    industry: string;
    state: string;
    turnover_range: string;
    company_age: string;
    funding_goal: string | null;
  };

  if (newParsed.success) {
    const d = newParsed.data.derived;
    payload = {
      email: newParsed.data.email.trim().toLowerCase(),
      business_type: d.business_type,
      industry: d.industry,
      state: d.state,
      turnover_range: d.turnover_range,
      company_age: d.company_age,
      funding_goal: d.funding_goal ?? null,
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

  const db = createServiceRoleClient();
  const { error } = await db.from("pending_profiles").upsert(
    {
      email: payload.email,
      business_type: payload.business_type,
      industry: payload.industry,
      state: payload.state,
      turnover_range: payload.turnover_range,
      company_age: payload.company_age,
      funding_goal: payload.funding_goal,
    },
    { onConflict: "email" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
