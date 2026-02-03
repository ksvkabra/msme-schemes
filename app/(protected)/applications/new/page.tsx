"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";

const schema = z.object({
  scheme_id: z.string().uuid(),
  bank_name: z.string().optional(),
  status: z.enum(["draft", "submitted"]),
});

type FormData = z.infer<typeof schema>;

export default function NewApplicationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const schemeId = searchParams.get("scheme_id") ?? "";
  const [schemeName, setSchemeName] = useState<string>("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { scheme_id: schemeId, status: "submitted" },
  });

  useEffect(() => {
    setValue("scheme_id", schemeId);
  }, [schemeId, setValue]);

  useEffect(() => {
    if (!schemeId) return;
    fetch(`/api/schemes/${schemeId}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => d?.name && setSchemeName(d.name))
      .catch(() => {});
  }, [schemeId]);

  async function onSubmit(data: FormData) {
    const res = await fetch("/api/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scheme_id: data.scheme_id,
        bank_name: data.bank_name || null,
        status: data.status,
      }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.error ?? "Failed to submit");
      return;
    }
    router.push("/applications");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-semibold">New application</h1>
      {schemeName && (
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Scheme: {schemeName}
        </p>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <input type="hidden" {...register("scheme_id")} />
        <div>
          <label className="block text-sm font-medium">Bank name (optional)</label>
          <input
            {...register("bank_name")}
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Submit as</label>
          <select
            {...register("status")}
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
          >
            <option value="draft">Draft</option>
            <option value="submitted">Submit now</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded bg-zinc-900 py-2 font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {isSubmitting ? "Saving…" : "Create application"}
        </button>
      </form>
    </div>
  );
}
