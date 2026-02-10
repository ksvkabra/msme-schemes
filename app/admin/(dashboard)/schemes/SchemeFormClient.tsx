"use client";

import { useRouter } from "next/navigation";
import { SchemeForm } from "../../SchemeForm";

export function SchemeFormClient({
  schemeId,
  initial,
}: {
  schemeId?: string;
  initial?: Parameters<typeof SchemeForm>[0]["initial"];
} = {}) {
  const router = useRouter();
  return (
    <SchemeForm
      schemeId={schemeId}
      initial={initial}
      onSuccess={() => {
        router.push("/admin");
        router.refresh();
      }}
    />
  );
}
