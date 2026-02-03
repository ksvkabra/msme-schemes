import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
          </nav>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[var(--muted)]">{user?.email}</span>
            <form action="/api/auth/signout" method="post">
              <button
                type="submit"
                className="text-sm text-[var(--muted)] hover:underline"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
