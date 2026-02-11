import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { matchSchemes } from "@/lib/eligibility/engine";
import { buildQuestionnaireSummaryRows } from "@/lib/eligibility/questions";
import type { BusinessProfile, Scheme } from "@/lib/db/types";

function eligibilityStatus(eligibleCount: number, totalMatches: number): "High" | "Medium" | "Low" {
  if (eligibleCount === 0) return "Low";
  if (eligibleCount >= 3 || (totalMatches > 0 && eligibleCount / totalMatches >= 0.5)) return "High";
  return "Medium";
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("business_profiles")
    .select("*")
    .eq("user_id", user?.id ?? "")
    .single();

  if (!profile || !user) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900 dark:bg-amber-950/30">
        <h2 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
          Complete your profile
        </h2>
        <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">
          Add your business details to see matching schemes.
        </p>
        <Link
          href="/eligibility"
          className="mt-4 inline-block rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
        >
          Complete eligibility
        </Link>
      </div>
    );
  }

  const { data: schemes } = await supabase.from("schemes").select("*");
  const results = matchSchemes(
    profile as unknown as BusinessProfile,
    (schemes ?? []) as Scheme[]
  );
  const eligibleCount = results.filter((r) => r.score >= 100).length;
  const status = eligibilityStatus(eligibleCount, results.length);

  await supabase.from("user_scheme_matches").delete().eq("user_id", user.id);
  if (results.length > 0) {
    await supabase.from("user_scheme_matches").insert(
      results.map((r) => ({
        user_id: user.id,
        scheme_id: r.scheme.id,
        match_score: r.score,
        missing_requirements: r.missingRequirements,
      }))
    );
  }

  const profileRow = profile as Record<string, unknown>;
  const entityType = profileRow.entity_type as "startup" | "msme" | null | undefined;
  const questionnaireResponses = profileRow.questionnaire_responses as Record<string, unknown> | null | undefined;
  const step2Responses = profileRow.step2_responses as Record<string, unknown> | null | undefined;
  const questionnaireRows = buildQuestionnaireSummaryRows(entityType, questionnaireResponses, step2Responses);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">
          Dashboard
        </h1>
        <p className="mt-1 text-[var(--muted)]">
          Schemes matched to your business profile.
        </p>
      </div>

      {questionnaireRows.length > 0 && (
        <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium uppercase tracking-wide text-[var(--muted)]">
                Your questionnaire & profile
              </h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Details you shared about your startup or MSME.
              </p>
            </div>
            <Link
              href="/dashboard/edit"
              className="shrink-0 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--background)]"
            >
              Edit profile
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {questionnaireRows.map((row, i) => (
              <li key={i} className="flex flex-col gap-0.5 border-b border-[var(--border)] pb-3 last:border-0 last:pb-0">
                <span className="text-sm font-medium text-[var(--muted)]">{row.title}</span>
                <span className="text-[var(--foreground)]">{row.label}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Summary card */}
      <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="text-sm font-medium uppercase tracking-wide text-[var(--muted)]">
          Your eligibility
        </h2>
        <div className="mt-4 flex flex-wrap items-center gap-6">
          <div>
            <p className="text-3xl font-bold text-[var(--foreground)]">
              {eligibleCount}
            </p>
            <p className="text-sm text-[var(--muted)]">Eligible schemes</p>
          </div>
          <div>
            <span
              className={`inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-semibold ${
                status === "High"
                  ? "bg-[var(--accent-muted)] text-[var(--accent-muted-foreground)]"
                  : status === "Medium"
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
                    : "bg-[var(--border)] text-[var(--muted)]"
              }`}
            >
              {status} eligibility
            </span>
          </div>
        </div>
      </section>

      {/* Scheme cards */}
      <section>
        <h2 className="text-lg font-medium text-[var(--foreground)]">
          Your matches
        </h2>
        <ul className="mt-4 space-y-4">
          {results.map((r) => {
            const scheme = r.scheme;
            const isEligible = r.score >= 100;
            const whyEligible = isEligible
              ? "Your business profile meets all criteria for this scheme."
              : null;
            return (
              <li
                key={scheme.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-[var(--foreground)]">
                      {scheme.name}
                    </h3>
                    {(scheme.key_benefit_display || scheme.benefit_summary) && (
                      <p className="mt-1 text-sm font-medium text-[var(--accent)]">
                        {scheme.key_benefit_display ?? scheme.benefit_summary}
                      </p>
                    )}
                    {whyEligible && (
                      <p className="mt-2 text-sm text-[var(--muted)]">
                        Why you qualify: {whyEligible}
                      </p>
                    )}
                    {!isEligible && r.missingRequirements.length > 0 && (
                      <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                        Missing: {r.missingRequirements.join("; ")}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                        isEligible
                          ? "bg-[var(--accent-muted)] text-[var(--accent-muted-foreground)]"
                          : "bg-[var(--border)] text-[var(--muted)]"
                      }`}
                    >
                      {r.score}%
                    </span>
                    <Link
                      href={`/schemes/${scheme.id}`}
                      className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--background)]"
                    >
                      View details
                    </Link>
                    {isEligible && (
                      <Link
                        href={`/applications/new?scheme_id=${scheme.id}`}
                        className="rounded-lg bg-[var(--primary)] px-3 py-1.5 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
                      >
                        Apply
                      </Link>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        {results.length === 0 && (
          <p className="text-sm text-[var(--muted)]">
            No matches yet. Update your profile or{" "}
            <Link href="/schemes" className="text-[var(--primary)] underline">
              browse all schemes
            </Link>
            .
          </p>
        )}
      </section>
    </div>
  );
}
