"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const QUESTIONNAIRE_STEPS = [
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

const TOTAL_STEPS = 1 + QUESTIONNAIRE_STEPS.length; // email + 6 questionnaire

export function EligibilityForm() {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [data, setData] = useState<FormData>({});
  const [sendingLink, setSendingLink] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showVerifyScreen, setShowVerifyScreen] = useState(false);
  const supabase = createClient();

  const baseUrl =
    typeof process.env.NEXT_PUBLIC_APP_URL === "string" && process.env.NEXT_PUBLIC_APP_URL
      ? process.env.NEXT_PUBLIC_APP_URL
      : typeof window !== "undefined" ? window.location.origin : "";

  // Step 0: email — send verification in background, then move to next step (no redirect)
  async function handleEmailNext(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim()) return;
    setSendingLink(true);
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${baseUrl}/auth/callback?next=${encodeURIComponent("/dashboard")}`,
      },
    });
    setSendingLink(false);
    if (err) {
      const isRateLimit = /rate limit|too many requests/i.test(err.message) || err.message?.includes("rate_limit");
      if (isRateLimit) {
        setError("Too many emails sent. Wait an hour or check your inbox for an existing link. You can still continue.");
        setStep(1); // Let them continue the questionnaire
        return;
      }
      setError(err.message);
      return;
    }
    setStep(1);
  }

  const questionnaireStepIndex = step - 1;
  const currentQuestion = QUESTIONNAIRE_STEPS[questionnaireStepIndex];
  const value = currentQuestion ? data[currentQuestion.key] : undefined;

  function handleSelect(val: string) {
    if (!currentQuestion) return;
    setData((prev) => ({ ...prev, [currentQuestion.key]: val }));
    if (questionnaireStepIndex < QUESTIONNAIRE_STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      submitQuestionnaire({ ...data, [currentQuestion.key]: val });
    }
  }

  async function submitQuestionnaire(final: FormData) {
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/eligibility/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        business_type: final.business_type,
        industry: final.industry,
        state: final.state,
        company_age: final.company_age,
        turnover_range: final.turnover_range,
        funding_goal: final.funding_goal ?? "any",
      }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Failed to save. Please try again.");
      return;
    }
    setShowVerifyScreen(true);
  }

  // ——— Verify your email to continue (no schemes) ———
  if (showVerifyScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4">
        <div className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-[var(--foreground)]">
            Verify your email to continue
          </h1>
          <p className="mt-3 text-sm text-[var(--muted)]">
            We&apos;ve sent a verification link to <strong>{email}</strong>. Click the link in that email to sign in and see your matched schemes.
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            You won&apos;t see any schemes until you&apos;ve verified. Check your inbox (and spam folder).
          </p>
          <Link
            href="/"
            className="mt-6 inline-block w-full rounded-lg border border-[var(--border)] bg-[var(--card)] py-2.5 text-center text-sm font-medium text-[var(--foreground)] hover:bg-[var(--background)]"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  // ——— Step 0: Email ———
  if (step === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4">
        <div className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm">
          <p className="text-sm font-medium text-[var(--muted)]">Step 1 of {TOTAL_STEPS}</p>
          <h1 className="mt-2 text-xl font-semibold text-[var(--foreground)]">
            Check your eligibility
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Enter your email. We&apos;ll send a verification link in the background — you can continue without waiting.
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
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={sendingLink}
              className="w-full rounded-lg bg-[var(--primary)] py-2.5 font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50"
            >
              {sendingLink ? "Sending link…" : "Continue"}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-[var(--muted)]">
            <Link href="/" className="hover:underline">Back to home</Link>
          </p>
        </div>
      </div>
    );
  }

  // ——— Steps 1–6: Questionnaire ———
  if (!currentQuestion) return null;

  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4">
      <div className="w-full max-w-lg">
        <div className="mb-6">
          <div className="flex justify-between text-sm text-[var(--muted)]">
            <span>Step {step + 1} of {TOTAL_STEPS}</span>
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
            {currentQuestion.title}
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            We use this to match you with the right schemes.
          </p>
          <ul className="mt-6 grid gap-3">
            {currentQuestion.options.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  disabled={submitting}
                  className={`w-full rounded-xl border-2 px-4 py-3.5 text-left text-base font-medium transition-colors ${
                    value === opt.value
                      ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--primary)]/50"
                  }`}
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
          {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
          {submitting && <p className="mt-4 text-sm text-[var(--muted)]">Saving…</p>}
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="mt-6 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            ← Back
          </button>
        </div>
        <p className="mt-4 text-center text-sm text-[var(--muted)]">
          <Link href="/" className="hover:underline">Back to home</Link>
        </p>
      </div>
    </div>
  );
}
