"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  STEP1_QUESTIONS,
  type Step1FormData,
} from "@/lib/eligibility/questions";
import { deriveProfileFromStep1 } from "@/lib/eligibility/derive-profile";

const STEP1_LEN = STEP1_QUESTIONS.length;

export default function OnboardingPage() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [step1Data, setStep1Data] = useState<Partial<Step1FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const current = STEP1_QUESTIONS[stepIndex];
  const isMulti = current?.multi === true;
  const maxSel = current?.maxSelections ?? 1;
  const rawValue = current
    ? step1Data[current.key as keyof Step1FormData]
    : undefined;
  const value =
    isMulti && Array.isArray(rawValue)
      ? rawValue
      : typeof rawValue === "string"
        ? rawValue
        : undefined;
  const selectedArr = isMulti ? (value as string[] | undefined) ?? [] : [];
  const canProceed =
    isMulti ? selectedArr.length >= 1 : value !== undefined && value !== "";

  function handleSelect(val: string) {
    if (!current) return;
    const key = current.key as keyof Step1FormData;
    if (isMulti) {
      const arr = selectedArr.includes(val)
        ? selectedArr.filter((x) => x !== val)
        : selectedArr.length >= maxSel
          ? [...selectedArr.slice(1), val]
          : [...selectedArr, val];
      setStep1Data((prev) => ({ ...prev, [key]: arr }));
      return;
    }
    setStep1Data((prev) => ({ ...prev, [key]: val }));
    if (stepIndex < STEP1_LEN - 1) {
      setStepIndex((i) => i + 1);
    } else {
      submit();
    }
  }

  function handleNext() {
    if (!canProceed) return;
    if (stepIndex < STEP1_LEN - 1) {
      setStepIndex((i) => i + 1);
    } else {
      submit();
    }
  }

  async function submit() {
    setIsSubmitting(true);
    setError("");
    const profile = deriveProfileFromStep1(step1Data);
    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        business_type: profile.business_type,
        industry: profile.industry,
        state: profile.state,
        turnover_range: profile.turnover_range,
        company_age: profile.company_age,
        funding_goal: profile.funding_goal ?? "any",
      }),
    });
    setIsSubmitting(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Failed to save");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  if (!current) return null;

  const progress = ((stepIndex + 1) / STEP1_LEN) * 100;

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-8">
        <div className="flex justify-between text-sm text-[var(--muted)]">
          <span>
            Step {stepIndex + 1} of {STEP1_LEN}
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--border)]">
          <div
            className="h-full rounded-full bg-[var(--primary)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <h1 className="text-2xl font-semibold text-[var(--foreground)]">
        {current.title}
      </h1>
      {(current.subtitle || !isMulti) && (
        <p className="mt-1 text-[var(--muted)]">
          {current.subtitle ?? "Choose one — we use this to match you with the right schemes."}
        </p>
      )}

      <ul className="mt-8 grid gap-3">
        {current.options.map((opt) => (
          <li key={opt.value}>
            <button
              type="button"
              onClick={() => handleSelect(opt.value)}
              disabled={isSubmitting}
              className={`w-full rounded-xl border-2 px-4 py-3.5 text-left text-base font-medium transition-colors ${
                isMulti
                  ? selectedArr.includes(opt.value)
                    ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                    : "border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:border-[var(--primary)]/50 hover:bg-[var(--background)]"
                  : value === opt.value
                    ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                    : "border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:border-[var(--primary)]/50 hover:bg-[var(--background)]"
              }`}
            >
              {opt.label}
            </button>
          </li>
        ))}
      </ul>

      {isMulti && (
        <>
          <p className="mt-3 text-sm text-[var(--muted)]">
            {selectedArr.length} of {maxSel} selected
          </p>
          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed || isSubmitting}
            className="mt-4 w-full rounded-lg bg-[var(--primary)] py-2.5 font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50"
          >
            Next
          </button>
        </>
      )}

      {error && (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {isSubmitting && (
        <p className="mt-4 text-sm text-[var(--muted)]">Saving…</p>
      )}

      {stepIndex > 0 && (
        <button
          type="button"
          onClick={() => setStepIndex((s) => s - 1)}
          className="mt-8 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          ← Back
        </button>
      )}
    </div>
  );
}
