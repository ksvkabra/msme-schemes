import { hasAdminSession } from "@/lib/admin";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAdmin = await hasAdminSession();
  if (!isAdmin) {
    redirect("/admin/login");
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
              Schemes
            </Link>
            <form action="/api/admin/signout" method="post">
              <button
                type="submit"
                className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                Sign out
              </button>
            </form>
          </nav>
          <span className="text-sm text-[var(--muted)]">Admin</span>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
