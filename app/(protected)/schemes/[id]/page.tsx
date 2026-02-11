import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function SchemeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: scheme, error } = await supabase
    .from("schemes")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !scheme) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  let match: { match_score: number; missing_requirements: string[] } | null = null;
  if (user) {
    const { data: m } = await supabase
      .from("user_scheme_matches")
      .select("match_score, missing_requirements")
      .eq("user_id", user.id)
      .eq("scheme_id", id)
      .single();
    match = m;
  }

  const isEligible = match && match.match_score >= 100;
  const documents: string[] = Array.isArray(scheme.required_documents)
    ? scheme.required_documents
    : [];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/schemes"
        className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
      >
        ← Back to schemes
      </Link>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">
          {scheme.name}
        </h1>
        <p className="mt-1 text-sm uppercase text-[var(--muted)]">
          {scheme.type}
        </p>
        {match && (
          <span
            className={`mt-4 inline-block rounded-lg px-2.5 py-1 text-sm font-medium ${
              isEligible
                ? "bg-[var(--accent-muted)] text-[var(--accent-muted-foreground)]"
                : "bg-[var(--border)] text-[var(--muted)]"
            }`}
          >
            Match: {match.match_score}%
          </span>
        )}

        {/* What you get */}
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
            What you get
          </h2>
          {scheme.key_benefit_display && (
            <p className="mt-2 text-lg font-semibold text-[var(--accent)]">
              {scheme.key_benefit_display}
            </p>
          )}
          {scheme.benefit_summary && (
            <p className="mt-2 text-[var(--foreground)]">
              {scheme.benefit_summary}
            </p>
          )}
        </section>

        {/* Why you qualify */}
        {match && (
          <section className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
              Why you qualify
            </h2>
            {isEligible ? (
              <p className="mt-2 text-[var(--foreground)]">
                Your business profile meets all eligibility criteria for this
                scheme.
              </p>
            ) : (
              <p className="mt-2 text-amber-700 dark:text-amber-300">
                Missing: {match.missing_requirements.join("; ")}
              </p>
            )}
          </section>
        )}

        {/* Required documents */}
        {documents.length > 0 && (
          <section className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
              Required documents
            </h2>
            <ul className="mt-3 space-y-2">
              {documents.map((doc, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-[var(--foreground)]"
                >
                  <span className="h-5 w-5 rounded border border-[var(--border)] bg-[var(--card)]" />
                  {doc}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Estimated timeline */}
        {scheme.estimated_timeline && (
          <section className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
              Estimated timeline
            </h2>
            <p className="mt-2 text-[var(--foreground)]">
              {scheme.estimated_timeline}
            </p>
          </section>
        )}

        {/* CTAs */}
        <div className="mt-8 flex flex-wrap gap-3">
          {isEligible && user && (
            <Link
              href={`/applications/new?scheme_id=${scheme.id}`}
              className="inline-flex rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] hover:opacity-90"
            >
              Start application
            </Link>
          )}
          <Link
            href="/help"
            className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--background)]"
          >
            Talk to advisor
          </Link>
        </div>

        {user && !match && (
          <p className="mt-6 text-sm text-[var(--muted)]">
            Complete your{" "}
            <Link
              href="/eligibility"
              className="text-[var(--primary)] underline"
            >
              business profile
            </Link>{" "}
            to see your match score.
          </p>
        )}
      </div>
    </div>
  );
}
