"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const NEXT = "/dashboard/onboarding";

export function EligibilityForm() {
  const [email, setEmail] = useState("");
  const [linkSent, setLinkSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const baseUrl =
      typeof process.env.NEXT_PUBLIC_APP_URL === "string" &&
      process.env.NEXT_PUBLIC_APP_URL
        ? process.env.NEXT_PUBLIC_APP_URL
        : window.location.origin;
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${baseUrl}/auth/callback?next=${encodeURIComponent(NEXT)}`,
      },
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setLinkSent(true);
  }

  if (linkSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4">
        <div className="w-full max-w-sm rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-[var(--foreground)]">
            Check your email
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            We sent a verification link to <strong>{email}</strong>. Click the
            link to continue and answer a few questions about your business.
          </p>
          <button
            type="button"
            onClick={() => setLinkSent(false)}
            className="mt-6 w-full rounded-lg border border-[var(--border)] py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--background)]"
          >
            Use a different email
          </button>
          <p className="mt-4 text-center text-sm text-[var(--muted)]">
            <Link href="/" className="hover:underline">
              Back to home
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4">
      <div className="w-full max-w-sm rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-[var(--foreground)]">
          Check your eligibility
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Enter your email. We&apos;ll send you a link to continue. No password
          needed.
        </p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
          />
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[var(--primary)] py-2 font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Sending…" : "Continue"}
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
