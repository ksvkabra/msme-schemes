import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function SchemesPage() {
  const supabase = await createClient();
  const { data: schemes } = await supabase
    .from("schemes")
    .select("id, name, type, benefit_summary")
    .order("name");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">All schemes</h1>
      <ul className="grid gap-4 sm:grid-cols-2">
        {(schemes ?? []).map((s) => (
          <li
            key={s.id}
            className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="font-medium">{s.name}</h2>
                <p className="mt-1 text-xs uppercase text-zinc-500 dark:text-zinc-400">
                  {s.type}
                </p>
                {s.benefit_summary && (
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                    {s.benefit_summary}
                  </p>
                )}
              </div>
              <Link
                href={`/schemes/${s.id}`}
                className="shrink-0 text-sm font-medium text-zinc-700 hover:underline dark:text-zinc-300"
              >
                View
              </Link>
            </div>
          </li>
        ))}
      </ul>
      {(!schemes || schemes.length === 0) && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No schemes in the database. Run the seed SQL in Supabase to add sample schemes.
        </p>
      )}
    </div>
  );
}
