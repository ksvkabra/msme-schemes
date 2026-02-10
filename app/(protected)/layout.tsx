import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import Link from "next/link";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAdmin = user ? isAdminEmail(user.email) : false;

  // Migrate pending_profiles → business_profiles for OTP sign-ins (callback only runs for magic-link redirects)
  if (user?.email) {
    const db = createServiceRoleClient();
    const { data: existing } = await db
      .from("business_profiles")
      .select("user_id")
      .eq("user_id", user.id)
      .single();
    if (!existing) {
      const email = user.email.trim().toLowerCase();
      const { data: pending } = await db
        .from("pending_profiles")
        .select("business_type, industry, state, turnover_range, company_age, funding_goal")
        .eq("email", email)
        .single();
      if (pending) {
        await db.from("business_profiles").upsert(
          {
            user_id: user.id,
            business_type: pending.business_type,
            industry: pending.industry,
            state: pending.state,
            turnover_range: pending.turnover_range,
            company_age: pending.company_age,
            funding_goal: pending.funding_goal ?? null,
          },
          { onConflict: "user_id" }
        );
        await db.from("pending_profiles").delete().eq("email", email);
      }
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <nav className="flex gap-6">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              Dashboard
            </Link>
            <Link
              href="/schemes"
              className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              Schemes
            </Link>
            <Link
              href="/applications"
              className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              Applications
            </Link>
            <Link
              href="/help"
              className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              Help
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="text-sm font-medium text-[var(--primary)] hover:underline"
              >
                Admin
              </Link>
            )}
          </nav>
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-[var(--muted)]">{user.email}</span>
              <form action="/api/auth/signout" method="post">
                <button
                  type="submit"
                  className="text-sm text-[var(--muted)] hover:underline"
                >
                  Sign out
                </button>
              </form>
            </div>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
