import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ProfileEditForm } from "../ProfileEditForm";

export default async function DashboardEditPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/edit");

  const { data: profile } = await supabase
    .from("business_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900 dark:bg-amber-950/30">
        <h2 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
          No profile yet
        </h2>
        <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">
          Complete the eligibility flow first to create a profile.
        </p>
        <Link
          href="/eligibility"
          className="mt-4 inline-block rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
        >
          Check eligibility
        </Link>
      </div>
    );
  }

  const row = profile as Record<string, unknown>;
  const entityType = (row.entity_type as "startup" | "msme") ?? "startup";
  const questionnaireResponses = (row.questionnaire_responses as Record<string, string | string[]>) ?? {};
  const step2Responses = (row.step2_responses as Record<string, string>) ?? {};

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          ← Back to dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
          Edit your profile
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Update your answers to see updated scheme matches.
        </p>
      </div>
      <ProfileEditForm
        initialEntityType={entityType}
        initialQuestionnaire={questionnaireResponses}
        initialStep2={step2Responses}
      />
    </div>
  );
}
