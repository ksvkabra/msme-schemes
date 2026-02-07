import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";

const TRACKER_STEPS = [
  { key: "eligibility", label: "Eligibility confirmed", description: "Your profile matches this scheme.", owner: "System" as const },
  { key: "documents", label: "Documents submitted", description: "Application and documents sent for review.", owner: "You" as const },
  { key: "review", label: "Bank review", description: "Bank or agency is reviewing your application.", owner: "Bank" as const },
  { key: "approval", label: "Approval", description: "Application approved.", owner: "Bank" as const },
  { key: "disbursal", label: "Disbursal", description: "Funds released to your account.", owner: "Bank" as const },
] as const;

function statusToStep(status: string): number {
  switch (status) {
    case "draft":
      return 0;
    case "submitted":
      return 1;
    case "under_review":
      return 2;
    case "approved":
      return 5;
    case "rejected":
      return -1;
    default:
      return 0;
  }
}

export default async function ApplicationTrackerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: application, error } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !application) notFound();

  const { data: scheme } = await supabase
    .from("schemes")
    .select("id, name")
    .eq("id", application.scheme_id)
    .single();

  const currentStep = statusToStep(application.status);
  const isRejected = application.status === "rejected";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/applications"
        className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
      >
        ← Back to applications
      </Link>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h1 className="text-xl font-semibold text-[var(--foreground)]">
          Application tracker
        </h1>
        <p className="mt-1 text-[var(--muted)]">
          {scheme?.name ?? application.scheme_id}
        </p>
        {application.bank_name && (
          <p className="mt-1 text-sm text-[var(--muted)]">
            Bank: {application.bank_name}
          </p>
        )}

        {isRejected ? (
          <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
            <p className="font-medium text-red-800 dark:text-red-200">
              This application was not approved.
            </p>
            <p className="mt-2 text-sm text-red-700 dark:text-red-300">
              You can start a new application for another scheme or talk to an
              advisor for guidance.
            </p>
            <Link
              href="/help"
              className="mt-4 inline-block text-sm font-medium text-red-700 underline dark:text-red-300"
            >
              Talk to advisor
            </Link>
          </div>
        ) : (
          <ul className="mt-8 space-y-0">
            {TRACKER_STEPS.map((step, index) => {
              const done = currentStep > index;
              const current = currentStep === index;
              const isLast = index === TRACKER_STEPS.length - 1;
              return (
                <li key={step.key} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold ${
                        done
                          ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-foreground)]"
                          : current
                            ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                            : "border-[var(--border)] bg-[var(--card)] text-[var(--muted)]"
                      }`}
                    >
                      {done ? "✓" : index + 1}
                    </span>
                    {!isLast && (
                      <div
                        className={`mt-1 h-full w-0.5 min-h-[2rem] ${
                          done ? "bg-[var(--accent)]" : "bg-[var(--border)]"
                        }`}
                      />
                    )}
                  </div>
                  <div className="pb-8">
                    <p
                      className={`font-medium ${
                        done || current
                          ? "text-[var(--foreground)]"
                          : "text-[var(--muted)]"
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="mt-0.5 text-sm text-[var(--muted)]">
                      {step.description}
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      Owner: {step.owner}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Link
        href="/help"
        className="inline-block text-sm font-medium text-[var(--primary)] hover:underline"
      >
        Need help? Talk to an advisor →
      </Link>
    </div>
  );
}
