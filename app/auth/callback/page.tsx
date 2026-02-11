"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");
  const [message, setMessage] = useState("Completing sign-in…");

  useEffect(() => {
    const next = searchParams.get("next") ?? "/dashboard";
    const code = searchParams.get("code");

    async function run() {
      const supabase = createClient();

      // 1. PKCE / code flow (e.g. future signInWithOtp with code in query)
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setStatus("error");
          setMessage(error.message);
          return;
        }
        window.location.replace(next);
        return;
      }

      // 2. Magic link / implicit flow: tokens in URL hash (server never sees the hash)
      const hash = typeof window !== "undefined" ? window.location.hash : "";
      if (hash) {
        const params = new URLSearchParams(hash.replace(/^#/, ""));
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");
        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (error) {
            setStatus("error");
            setMessage(error.message);
            return;
          }
          // Clear hash from URL then redirect (avoids leaking tokens in history)
          window.history.replaceState(null, "", window.location.pathname + window.location.search);
          window.location.replace(next);
          return;
        }
      }

      setStatus("done");
      setMessage("No session data found. Redirecting…");
      window.location.replace(next);
    }

    run();
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-8 py-6">
        {status === "loading" && <p className="text-[var(--muted)]">{message}</p>}
        {status === "error" && <p className="text-red-600 dark:text-red-400">{message}</p>}
        {status === "done" && <p className="text-[var(--muted)]">{message}</p>}
      </div>
    </div>
  );
}
