import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <span className="text-lg font-semibold text-[var(--primary)]">
            MSME Schemes
          </span>
          <nav className="flex items-center gap-6">
            <a
              href="#how-it-works"
              className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              How it works
            </a>
            <Link
              href="/login"
              className="text-sm font-medium text-[var(--foreground)] hover:opacity-80"
            >
              Log in
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:py-28">
          <h1 className="text-4xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl">
            Discover government schemes and loans you’re eligible for
          </h1>
          <p className="mt-6 text-lg text-[var(--muted)]">
            Startups and MSMEs: answer a few questions and get a clear list of
            schemes that match your business — no jargon, no guesswork.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/login?next=/dashboard/onboarding"
              className="inline-flex w-full items-center justify-center rounded-lg bg-[var(--primary)] px-6 py-3.5 text-base font-semibold text-[var(--primary-foreground)] shadow-sm hover:bg-[var(--primary-hover)] sm:w-auto"
            >
              Check my eligibility
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex w-full items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] px-6 py-3.5 text-base font-semibold text-[var(--foreground)] hover:bg-[var(--background)] sm:w-auto"
            >
              How it works
            </a>
          </div>
        </section>

        <section
          id="how-it-works"
          className="border-t border-[var(--border)] bg-[var(--card)] py-16"
        >
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="text-center text-2xl font-semibold text-[var(--foreground)]">
              How it works
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-center text-[var(--muted)]">
              Simple, transparent, and designed for busy founders.
            </p>
            <ul className="mt-12 grid gap-8 sm:grid-cols-3">
              <li className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-lg font-bold text-[var(--primary)]">
                  1
                </span>
                <h3 className="mt-4 font-semibold text-[var(--foreground)]">
                  Answer a few questions
                </h3>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Business type, industry, location, and turnover — we use this
                  to match you with the right schemes.
                </p>
              </li>
              <li className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-lg font-bold text-[var(--primary)]">
                  2
                </span>
                <h3 className="mt-4 font-semibold text-[var(--foreground)]">
                  See your matches
                </h3>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Get a clear dashboard of eligible schemes with benefits and
                  what you need to apply.
                </p>
              </li>
              <li className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-lg font-bold text-[var(--accent)]">
                  3
                </span>
                <h3 className="mt-4 font-semibold text-[var(--foreground)]">
                  Apply with confidence
                </h3>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Start applications, track status, and get help from an advisor
                  when you need it.
                </p>
              </li>
            </ul>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <p className="text-sm text-[var(--muted)]">
              Trusted by startups and small businesses to find the right
              government support. No spam, no complexity.
            </p>
            <Link
              href="/login?next=/dashboard/onboarding"
              className="mt-6 inline-block rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)]"
            >
              Check my eligibility
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border)] py-8">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-[var(--muted)]">
          MSME Schemes — Eligibility discovery for government schemes and loans.
        </div>
      </footer>
    </div>
  );
}
