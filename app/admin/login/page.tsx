import Link from "next/link";
import { AdminLoginForm } from "./AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-4">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 max-w-md w-full space-y-4">
        <h1 className="text-xl font-semibold text-[var(--foreground)] text-center">
          Admin login
        </h1>
        <p className="text-sm text-[var(--muted)] text-center">
          Sign in with the admin password. This is separate from the main app.
        </p>
        <AdminLoginForm />
      </div>
      <Link
        href="/"
        className="mt-6 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
      >
        ← Back to site
      </Link>
    </div>
  );
}
