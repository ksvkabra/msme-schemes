import { createServiceRoleClient } from "@/lib/supabase/server";
import Link from "next/link";
import { DeleteSchemeButton } from "../DeleteSchemeButton";

export default async function AdminDashboardPage() {
  const db = createServiceRoleClient();
  const { data: schemes, error } = await db
    .from("schemes")
    .select("id, name, type, benefit_summary")
    .order("name");

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
        <p className="text-red-800 dark:text-red-200">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">
          Scheme management
        </h1>
        <Link
          href="/admin/schemes/new"
          className="inline-flex rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] hover:opacity-90"
        >
          Add scheme
        </Link>
      </div>

      {!schemes?.length ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 text-center text-[var(--muted)]">
          No schemes yet. Add one to get started.
        </div>
      ) : (
        <ul className="space-y-3">
          {schemes.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"
            >
              <div>
                <p className="font-medium text-[var(--foreground)]">{s.name}</p>
                <p className="text-sm text-[var(--muted)]">
                  {s.type}
                  {s.benefit_summary ? ` · ${s.benefit_summary.slice(0, 60)}…` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/schemes/${s.id}/edit`}
                  className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-sm font-medium hover:bg-[var(--border)]"
                >
                  Edit
                </Link>
                <DeleteSchemeButton schemeId={s.id} schemeName={s.name} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
