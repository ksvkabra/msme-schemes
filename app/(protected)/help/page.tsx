import Link from "next/link";

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">
          Help & advisor
        </h1>
        <p className="mt-1 text-[var(--muted)]">
          We’re here to help you with applications and documents. Choose how
          you’d like to connect.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-1">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="font-semibold text-[var(--foreground)]">
            Chat with an advisor
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Get quick answers about eligibility, documents, or next steps. Our
            team typically replies within a few hours.
          </p>
          <button
            type="button"
            className="mt-4 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] hover:opacity-90"
          >
            Start chat (coming soon)
          </button>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="font-semibold text-[var(--foreground)]">
            Book a call
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Prefer to speak with someone? Book a short call and we’ll walk you
            through your application or scheme options.
          </p>
          <button
            type="button"
            className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--background)]"
          >
            Book a call (coming soon)
          </button>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="font-semibold text-[var(--foreground)]">
            Upload documents for review
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Upload your documents and we’ll check if everything is in order
            before you submit to the bank or agency.
          </p>
          <button
            type="button"
            className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--background)]"
          >
            Upload documents (coming soon)
          </button>
        </div>
      </div>

      <p className="text-center text-sm text-[var(--muted)]">
        In the meantime, you can review your{" "}
        <Link href="/dashboard" className="text-[var(--primary)] underline">
          dashboard
        </Link>{" "}
        or{" "}
        <Link href="/applications" className="text-[var(--primary)] underline">
          applications
        </Link>
        .
      </p>
    </div>
  );
}
