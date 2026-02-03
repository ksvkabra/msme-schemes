import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function ApplicationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: applications } = await supabase
    .from("applications")
    .select("id, scheme_id, status, bank_name, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const schemeIds = [...new Set((applications ?? []).map((a) => a.scheme_id))];
  const { data: schemes } =
    schemeIds.length > 0
      ? await supabase.from("schemes").select("id, name").in("id", schemeIds)
      : { data: [] };
  const schemeMap = new Map((schemes ?? []).map((s) => [s.id, s.name]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">
          Applications
        </h1>
        <Link
          href="/applications/new"
          className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
        >
          New application
        </Link>
      </div>
      <ul className="space-y-3">
        {(applications ?? []).map((a) => (
          <li
            key={a.id}
            className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"
          >
            <Link href={`/applications/${a.id}`} className="min-w-0 flex-1">
              <p className="font-medium text-[var(--foreground)]">
                {schemeMap.get(a.scheme_id) ?? a.scheme_id}
              </p>
              {a.bank_name && (
                <p className="text-sm text-[var(--muted)]">{a.bank_name}</p>
              )}
            </Link>
            <span
              className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium ${
                a.status === "approved"
                  ? "bg-[var(--accent-muted)] text-[var(--accent-muted-foreground)]"
                  : a.status === "rejected"
                    ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                    : "bg-[var(--border)] text-[var(--muted)]"
              }`}
            >
              {a.status.replace("_", " ")}
            </span>
            <Link
              href={`/applications/${a.id}`}
              className="ml-2 shrink-0 text-sm font-medium text-[var(--primary)] hover:underline"
            >
              View
            </Link>
          </li>
        ))}
      </ul>
      {(!applications || applications.length === 0) && (
        <p className="text-sm text-[var(--muted)]">
          No applications yet. Apply from the dashboard or schemes page.
        </p>
      )}
    </div>
  );
}
