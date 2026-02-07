import { Suspense } from "react";
import { EligibilityForm } from "./EligibilityForm";

export default function EligibilityEntryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
          Loading…
        </div>
      }
    >
      <EligibilityForm />
    </Suspense>
  );
}
