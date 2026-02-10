import Link from "next/link";
import { SchemeFormClient } from "../SchemeFormClient";

export default function NewSchemePage() {
  return (
    <div className="space-y-6">
      <Link
        href="/admin"
        className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
      >
        ← Back to schemes
      </Link>
      <h1 className="text-2xl font-semibold text-[var(--foreground)]">
        Add scheme
      </h1>
      <SchemeFormClient />
    </div>
  );
}
