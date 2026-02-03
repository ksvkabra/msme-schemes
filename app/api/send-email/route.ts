import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { sendEmail, eligibilitySummaryHtml } from "@/lib/email/send";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { type, to } = body as { type: string; to?: string };
  const email = to ?? user.email;
  if (!email) {
    return NextResponse.json(
      { error: "No email address" },
      { status: 400 }
    );
  }

  if (type === "eligibility_summary") {
    const { data: matches } = await supabase
      .from("user_scheme_matches")
      .select("scheme_id, match_score")
      .eq("user_id", user.id)
      .gte("match_score", 100);

    const schemeIds = (matches ?? []).map((m) => m.scheme_id);
    const { data: schemes } = await supabase
      .from("schemes")
      .select("name")
      .in("id", schemeIds);

    const schemeNames = (schemes ?? []).map((s) => s.name);
    const html = eligibilitySummaryHtml(
      user.user_metadata?.name ?? "there",
      schemeNames.length,
      schemeNames
    );
    const result = await sendEmail({
      to: email,
      subject: "Your MSME scheme eligibility summary",
      html,
    });
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 502 }
      );
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json(
    { error: "Unknown email type" },
    { status: 400 }
  );
}
