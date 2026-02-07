"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteSchemeButton({
  schemeId,
  schemeName,
}: {
  schemeId: string;
  schemeName: string;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete scheme "${schemeName}"? This cannot be undone.`)) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/schemes/${schemeId}`, { method: "DELETE" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(j.error ?? "Failed to delete");
        return;
      }
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/50"
    >
      {isDeleting ? "Deleting…" : "Delete"}
    </button>
  );
}
