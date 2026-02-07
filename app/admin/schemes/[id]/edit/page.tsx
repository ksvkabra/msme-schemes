import { createServiceRoleClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SchemeFormClient } from "../SchemeFormClient";

export default async function EditSchemePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = createServiceRoleClient();
  const { data: scheme, error } = await db
    .from("schemes")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !scheme) notFound();

  const initial = {
    name: scheme.name,
    type: scheme.type,
    benefit_summary: scheme.benefit_summary ?? "",
    key_benefit_display: scheme.key_benefit_display ?? "",
    required_documents: Array.isArray(scheme.required_documents) ? scheme.required_documents : [],
    estimated_timeline: scheme.estimated_timeline ?? "",
    states_applicable: Array.isArray(scheme.states_applicable) ? scheme.states_applicable : [],
    eligibility_rules: (scheme.eligibility_rules as object) ?? {},
  };

  return (
    <div className="space-y-6">
      <Link
        href="/admin"
        className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
      >
        ← Back to schemes
      </Link>
      <h1 className="text-2xl font-semibold text-[var(--foreground)]">
        Edit: {scheme.name}
      </h1>
      <SchemeFormClient schemeId={id} initial={initial} />
    </div>
  );
}
