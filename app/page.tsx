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
          <div className="mt-10">
            <Link
              href="/eligibility"
              className="inline-flex items-center justify-center rounded-lg bg-[var(--primary)] px-8 py-4 text-base font-semibold text-[var(--primary-foreground)] shadow-sm hover:bg-[var(--primary-hover)]"
            >
              Check my eligibility
            </Link>
          </div>
        </section>

        {/* Why This Platform */}
        <section className="border-t border-[var(--border)] bg-[var(--card)] py-16">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="text-center text-2xl font-semibold text-[var(--foreground)]">
              Why this platform
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-[var(--muted)]">
              Government schemes are hard to navigate. Different ministries, banks, and state portals — each with its own rules and deadlines. Most founders don&apos;t know which schemes they qualify for or miss out simply because they never applied.
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-center text-[var(--muted)]">
              We cut through the confusion: one short questionnaire, one dashboard, and a clear list of schemes that match your business.
            </p>
          </div>
        </section>

        {/* What you're missing out on */}
        <section className="border-t border-[var(--border)] py-16">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="text-center text-2xl font-semibold text-[var(--foreground)]">
              What you might be missing out on
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-[var(--muted)]">
              Subsidies on loans, margin money support, interest subvention, and one-time grants. Many MSMEs and startups leave money on the table because they never checked eligibility or assumed they didn&apos;t qualify.
            </p>
            <ul className="mx-auto mt-8 grid max-w-2xl gap-3 text-[var(--muted)] sm:grid-cols-2">
              <li className="flex items-start gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
                <span className="text-[var(--primary)]">•</span>
                <span>Credit-linked subsidies and margin money</span>
              </li>
              <li className="flex items-start gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
                <span className="text-[var(--primary)]">•</span>
                <span>Small-ticket loans (e.g. MUDRA) without collateral</span>
              </li>
              <li className="flex items-start gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
                <span className="text-[var(--primary)]">•</span>
                <span>State-specific grants and incentives</span>
              </li>
              <li className="flex items-start gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
                <span className="text-[var(--primary)]">•</span>
                <span>Guarantee schemes that reduce bank risk</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Testimonials */}
        <section className="border-t border-[var(--border)] bg-[var(--card)] py-16">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="text-center text-2xl font-semibold text-[var(--foreground)]">
              What others say
            </h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-3">
              <blockquote className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-6">
                <p className="text-sm text-[var(--muted)]">
                  &quot;Finally understood which schemes I can actually apply for. Saved hours of searching.&quot;
                </p>
                <footer className="mt-4 text-sm font-medium text-[var(--foreground)]">
                  — Founder, small manufacturing unit
                </footer>
              </blockquote>
              <blockquote className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-6">
                <p className="text-sm text-[var(--muted)]">
                  &quot;Clear list of documents and timeline. Made the application process less daunting.&quot;
                </p>
                <footer className="mt-4 text-sm font-medium text-[var(--foreground)]">
                  — MSME, services sector
                </footer>
              </blockquote>
              <blockquote className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-6">
                <p className="text-sm text-[var(--muted)]">
                  &quot;Got matched with a scheme I hadn&apos;t heard of. Applied and got the subsidy.&quot;
                </p>
                <footer className="mt-4 text-sm font-medium text-[var(--foreground)]">
                  — Startup, technology
                </footer>
              </blockquote>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="border-t border-[var(--border)] py-16"
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
            <div className="mt-10 text-center">
              <Link
                href="/eligibility"
                className="inline-flex items-center justify-center rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)]"
              >
                Check my eligibility
              </Link>
            </div>
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
