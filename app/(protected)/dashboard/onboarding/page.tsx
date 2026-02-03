"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STEPS = [
  { key: "business_type", title: "Type of business", options: [
    { value: "startup", label: "Startup" },
    { value: "micro", label: "Micro" },
    { value: "small", label: "Small" },
    { value: "medium", label: "Medium" },
  ]},
  { key: "industry", title: "Industry", options: [
    { value: "Manufacturing", label: "Manufacturing" },
    { value: "Services", label: "Services" },
    { value: "Trading", label: "Trading" },
    { value: "Technology", label: "Technology" },
    { value: "Agriculture", label: "Agriculture" },
    { value: "Other", label: "Other" },
  ]},
  { key: "state", title: "State / location", options: [
    { value: "Maharashtra", label: "Maharashtra" },
    { value: "Karnataka", label: "Karnataka" },
    { value: "Gujarat", label: "Gujarat" },
    { value: "Tamil Nadu", label: "Tamil Nadu" },
    { value: "Delhi", label: "Delhi" },
    { value: "Uttar Pradesh", label: "Uttar Pradesh" },
    { value: "Other", label: "Other" },
  ]},
  { key: "company_age", title: "Company age", options: [
    { value: "0-1", label: "Less than 1 year" },
    { value: "1-3", label: "1–3 years" },
    { value: "3-5", label: "3–5 years" },
    { value: "5-10", label: "5–10 years" },
    { value: "10+", label: "More than 10 years" },
  ]},
  { key: "turnover_range", title: "Turnover range (₹ lakhs)", options: [
    { value: "0-10", label: "0–10" },
    { value: "10-50", label: "10–50" },
    { value: "50-100", label: "50–100" },
    { value: "100-250", label: "100–250" },
    { value: "250+", label: "250+" },
  ]},
  { key: "funding_goal", title: "Funding goal", options: [
    { value: "loan", label: "Loan" },
    { value: "subsidy", label: "Subsidy" },
    { value: "grant", label: "Grant" },
    { value: "any", label: "Any" },
  ]},
] as const;

type FormData = Record<string, string>;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const current = STEPS[step];
  const value = data[current?.key];

  function handleSelect(val: string) {
    setData((prev) => ({ ...prev, [current.key]: val }));
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      submit({ ...data, [current.key]: val });
    }
  }

  async function submit(final: FormData) {
    setIsSubmitting(true);
    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        business_type: final.business_type,
        industry: final.industry,
        state: final.state,
        company_age: final.company_age,
        turnover_range: final.turnover_range,
        funding_goal: final.funding_goal ?? "any",
      }),
    });
    setIsSubmitting(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.error ?? "Failed to save");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  if (!current) return null;

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-8">
        <div className="flex justify-between text-sm text-[var(--muted)]">
          <span>Step {step + 1} of {STEPS.length}</span>
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
      <p className="mt-1 text-[var(--muted)]">
        Choose one — we use this to match you with the right schemes.
      </p>

      <ul className="mt-8 grid gap-3">
        {current.options.map((opt) => (
          <li key={opt.value}>
            <button
              type="button"
              onClick={() => handleSelect(opt.value)}
              disabled={isSubmitting}
              className={`w-full rounded-xl border-2 px-4 py-3.5 text-left text-base font-medium transition-colors ${
                value === opt.value
                  ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                  : "border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:border-[var(--primary)]/50 hover:bg-[var(--background)]"
              }`}
            >
              {opt.label}
            </button>
          </li>
        ))}
      </ul>

      {step > 0 && (
        <button
          type="button"
          onClick={() => setStep((s) => s - 1)}
          className="mt-8 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          ← Back
        </button>
      )}

      {isSubmitting && (
        <p className="mt-4 text-sm text-[var(--muted)]">Saving…</p>
      )}
    </div>
  );
}
