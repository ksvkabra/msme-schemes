"use client";

import { useState } from "react";
import Link from "next/link";
import {
  STEP1_QUESTIONS,
  STEP2_QUESTIONS,
  type Step1FormData,
} from "@/lib/eligibility/questions";
import { deriveProfileFromStep1 } from "@/lib/eligibility/derive-profile";
import type { Scheme } from "@/lib/db/types";

type Phase = "email" | "step1" | "results" | "step2" | "verify";

type MatchResult = {
  scheme: Scheme;
  score: number;
  missingRequirements: string[];
};

const STEP1_LEN = STEP1_QUESTIONS.length;
const STEP2_LEN = STEP2_QUESTIONS.length;

export function EligibilityForm() {
  const [phase, setPhase] = useState<Phase>("email");
  const [step1Index, setStep1Index] = useState(0);
  const [step2Index, setStep2Index] = useState(0);
  const [email, setEmail] = useState("");
  const [step1Data, setStep1Data] = useState<Partial<Step1FormData>>({});
  const [step2Data, setStep2Data] = useState<Record<string, string>>({});
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ——— Email step: collect email only, no verification. ———
  function handleEmailNext(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim()) return;
    setPhase("step1");
  }

  // ——— Step 1: single or multi select ———
  const currentStep1 = STEP1_QUESTIONS[step1Index];
  const isMulti = currentStep1?.multi === true;
  const maxSel = currentStep1?.maxSelections ?? 1;
  const rawValue = currentStep1
    ? step1Data[currentStep1.key as keyof Step1FormData]
    : undefined;
  const value =
    isMulti && Array.isArray(rawValue)
      ? rawValue
      : typeof rawValue === "string"
        ? rawValue
        : undefined;
  const selectedArr = isMulti ? (value as string[] | undefined) ?? [] : [];
  const canProceedStep1 =
    isMulti ? selectedArr.length >= 1 : value !== undefined && value !== "";

  function handleStep1Select(val: string) {
    if (!currentStep1) return;
    const key = currentStep1.key as keyof Step1FormData;
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
    if (step1Index < STEP1_LEN - 1) {
      setStep1Index((i) => i + 1);
    } else {
      fetchMatchesAndShowResults();
    }
  }

  function handleStep1Next() {
    if (!canProceedStep1) return;
    if (step1Index < STEP1_LEN - 1) {
      setStep1Index((i) => i + 1);
    } else {
      fetchMatchesAndShowResults();
    }
  }

  async function fetchMatchesAndShowResults() {
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/eligibility/preview-matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(step1Data),
    });
    setSubmitting(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Could not load matches. Please try again.");
      return;
    }
    const json = await res.json();
    setMatches(json.matches ?? []);
    setPhase("results");
  }

  // ——— Results: Save & email OR Continue with full questionnaire ———
  async function handleSaveAndEmail() {
    setSubmitting(true);
    setError("");
    const profile = deriveProfileFromStep1(step1Data);
    const res = await fetch("/api/eligibility/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        step1: step1Data,
        derived: {
          business_type: profile.business_type,
          industry: profile.industry,
          state: profile.state,
          turnover_range: profile.turnover_range,
          company_age: profile.company_age,
          funding_goal: profile.funding_goal,
        },
      }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Failed to save. Please try again.");
      return;
    }
    setPhase("verify");
  }

  function handleContinueFullQuestionnaire() {
    setPhase("step2");
    setStep2Index(0);
  }

  // ——— Step 2: extended questions ———
  const currentStep2 = STEP2_QUESTIONS[step2Index];
  const step2Value = currentStep2
    ? step2Data[currentStep2.key]
    : undefined;

  function handleStep2Select(val: string) {
    if (!currentStep2) return;
    setStep2Data((prev) => ({ ...prev, [currentStep2.key]: val }));
    if (step2Index < STEP2_LEN - 1) {
      setStep2Index((i) => i + 1);
    } else {
      submitWithStep2();
    }
  }

  async function submitWithStep2() {
    setSubmitting(true);
    setError("");
    const profile = deriveProfileFromStep1(step1Data);
    const res = await fetch("/api/eligibility/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        step1: step1Data,
        step2: step2Data,
        derived: {
          business_type: profile.business_type,
          industry: profile.industry,
          state: profile.state,
          turnover_range: profile.turnover_range,
          company_age: profile.company_age,
          funding_goal: profile.funding_goal,
        },
      }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Failed to save. Please try again.");
      return;
    }
    setPhase("verify");
  }

  // ——— Done: profile saved for this email. ———
  if (phase === "verify") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4">
        <div className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-[var(--foreground)]">
            All set
          </h1>
          <p className="mt-3 text-sm text-[var(--muted)]">
            We&apos;ve saved your profile for <strong>{email}</strong>. Sign in anytime to see your matched schemes on the dashboard.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/"
              className="w-full rounded-lg bg-[var(--primary)] py-2.5 text-center text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ——— Email step ———
  if (phase === "email") {
    const totalSteps = 1 + STEP1_LEN;
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4">
        <div className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm">
          <p className="text-sm font-medium text-[var(--muted)]">
            Step 1 of {totalSteps}
          </p>
          <h1 className="mt-2 text-xl font-semibold text-[var(--foreground)]">
            Check your eligibility
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Enter your email to continue.
          </p>
          <form onSubmit={handleEmailNext} className="mt-6 space-y-3">
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5"
            />
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
            <button
              type="submit"
              className="w-full rounded-lg bg-[var(--primary)] py-2.5 font-medium text-[var(--primary-foreground)] hover:opacity-90"
            >
              Continue
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-[var(--muted)]">
            <Link href="/" className="hover:underline">
              Back to home
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // ——— Results (after step 1) ———
  if (phase === "results") {
    const profile = deriveProfileFromStep1(step1Data);
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4">
        <div className="w-full max-w-2xl rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-[var(--foreground)]">
            Your matched schemes
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Based on your answers we&apos;ve classified you as{" "}
            <strong>{profile.business_type}</strong> in {profile.industry}.
          </p>
          <div className="mt-6 max-h-80 space-y-3 overflow-y-auto">
            {matches.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">
                No schemes matched yet. Complete the full questionnaire or try
                different criteria.
              </p>
            ) : (
              matches.slice(0, 15).map((m) => (
                <div
                  key={m.scheme.id}
                  className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
                >
                  <div className="flex justify-between gap-2">
                    <span className="font-medium text-[var(--foreground)]">
                      {m.scheme.name}
                    </span>
                    <span className="text-sm text-[var(--muted)]">
                      {m.score}% match
                    </span>
                  </div>
                  {m.scheme.key_benefit_display && (
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {m.scheme.key_benefit_display}
                    </p>
                  )}
                  {m.missingRequirements.length > 0 && (
                    <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                      Missing: {m.missingRequirements.join(", ")}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={handleSaveAndEmail}
              disabled={submitting}
              className="w-full rounded-lg bg-[var(--primary)] py-2.5 font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Saving…" : "Save & get results by email"}
            </button>
            <button
              type="button"
              onClick={handleContinueFullQuestionnaire}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] py-2.5 font-medium text-[var(--foreground)] hover:bg-[var(--background)]"
            >
              Continue with full questionnaire
            </button>
          </div>
          {error && (
            <p className="mt-4 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          <p className="mt-4 text-center text-sm text-[var(--muted)]">
            <Link href="/" className="hover:underline">
              Back to home
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // ——— Step 2: extended questionnaire ———
  if (phase === "step2" && currentStep2) {
    const totalSteps = STEP2_LEN;
    const progress = ((step2Index + 1) / totalSteps) * 100;
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4">
        <div className="w-full max-w-lg">
          <div className="mb-6">
            <div className="flex justify-between text-sm text-[var(--muted)]">
              <span>
                Full questionnaire — {step2Index + 1} of {totalSteps}
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--border)]">
              <div
                className="h-full rounded-full bg-[var(--primary)] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-8">
            <h1 className="text-xl font-semibold text-[var(--foreground)]">
              {currentStep2.title}
            </h1>
            {currentStep2.subtitle && (
              <p className="mt-1 text-sm text-[var(--muted)]">
                {currentStep2.subtitle}
              </p>
            )}
            <ul className="mt-6 grid gap-3">
              {currentStep2.options.map((opt) => (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => handleStep2Select(opt.value)}
                    disabled={submitting}
                    className={`w-full rounded-xl border-2 px-4 py-3.5 text-left text-base font-medium transition-colors ${
                      step2Value === opt.value
                        ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--primary)]/50"
                    }`}
                  >
                    {opt.label}
                  </button>
                </li>
              ))}
            </ul>
            {error && (
              <p className="mt-4 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
            <button
              type="button"
              onClick={() => setStep2Index((i) => Math.max(0, i - 1))}
              className="mt-6 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              ← Back
            </button>
          </div>
          <p className="mt-4 text-center text-sm text-[var(--muted)]">
            <Link href="/" className="hover:underline">
              Back to home
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // ——— Step 1: 12 questions ———
  if (phase === "step1" && currentStep1) {
    const totalSteps = 1 + STEP1_LEN;
    const progress = ((1 + step1Index + 1) / totalSteps) * 100;
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4">
        <div className="w-full max-w-lg">
          <div className="mb-6">
            <div className="flex justify-between text-sm text-[var(--muted)]">
              <span>
                Step {step1Index + 2} of {totalSteps}
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--border)]">
              <div
                className="h-full rounded-full bg-[var(--primary)] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-8">
            <h1 className="text-xl font-semibold text-[var(--foreground)]">
              {currentStep1.title}
            </h1>
            {currentStep1.subtitle && (
              <p className="mt-1 text-sm text-[var(--muted)]">
                {currentStep1.subtitle}
              </p>
            )}
            <ul className="mt-6 grid gap-3">
              {currentStep1.options.map((opt) => (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => handleStep1Select(opt.value)}
                    disabled={submitting}
                    className={`w-full rounded-xl border-2 px-4 py-3.5 text-left text-base font-medium transition-colors ${
                      isMulti
                        ? selectedArr.includes(opt.value)
                          ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                          : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--primary)]/50"
                        : value === opt.value
                          ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                          : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--primary)]/50"
                    }`}
                  >
                    {opt.label}
                  </button>
                </li>
              ))}
            </ul>
            {isMulti && (
              <p className="mt-3 text-sm text-[var(--muted)]">
                {selectedArr.length} of {maxSel} selected
              </p>
            )}
            {isMulti && (
              <button
                type="button"
                onClick={handleStep1Next}
                disabled={!canProceedStep1 || submitting}
                className="mt-4 w-full rounded-lg bg-[var(--primary)] py-2.5 font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50"
              >
                Next
              </button>
            )}
            {error && (
              <p className="mt-4 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
            {submitting && (
              <p className="mt-4 text-sm text-[var(--muted)]">Loading…</p>
            )}
            <button
              type="button"
              onClick={() =>
                step1Index > 0
                  ? setStep1Index((i) => i - 1)
                  : setPhase("email")
              }
              className="mt-6 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              ← Back
            </button>
          </div>
          <p className="mt-4 text-center text-sm text-[var(--muted)]">
            <Link href="/" className="hover:underline">
              Back to home
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return null;
}
