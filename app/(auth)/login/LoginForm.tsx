"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";

  const supabase = createClient();

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setOtpSent(true);
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.push(next);
    router.refresh();
  }

  if (otpSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4">
        <div className="w-full max-w-sm rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-[var(--foreground)]">Check your email</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            We sent a one-time code to <strong>{email}</strong>. Enter it below.
          </p>
          <form onSubmit={handleVerifyOtp} className="mt-4 space-y-3">
            <input
              type="text"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-center font-mono text-lg"
              maxLength={6}
              autoFocus
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[var(--primary)] py-2 font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Verifying…" : "Verify"}
            </button>
          </form>
          <button
            type="button"
            onClick={() => setOtpSent(false)}
            className="mt-4 w-full text-sm text-[var(--muted)] hover:underline"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4">
      <div className="w-full max-w-sm rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-[var(--foreground)]">Log in</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          We’ll send a one-time code to your email. No password needed.
        </p>
        <form onSubmit={handleSendOtp} className="mt-4 space-y-3">
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[var(--primary)] py-2 font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Sending…" : "Send code"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-[var(--muted)]">
          <a href="/" className="hover:underline">Back to home</a>
        </p>
      </div>
    </div>
  );
}
