import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <nav className="flex gap-6">
            <Link
              href="/admin"
              className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              Admin — Schemes
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              ← Back to app
            </Link>
          </nav>
          <span className="text-sm text-[var(--muted)]">{user.email}</span>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
