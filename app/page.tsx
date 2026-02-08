import Image from "next/image";
import Link from "next/link";
import { LandingHeader } from "./LandingHeader";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1920&q=80";

function IconSubsidy() {
  return (
    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}
function IconLoan() {
  return (
    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  );
}
function IconGrant() {
  return (
    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M9 22V12h6v10" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="M22 4L12 14.01l-3-3" />
    </svg>
  );
}
function IconQuote() {
  return (
    <svg className="h-10 w-10 text-[var(--primary)]/30" fill="currentColor" viewBox="0 0 24 24">
      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]" data-theme="light">
      <LandingHeader />

      <main>
        {/* ——— BANNER: image + overlay, one CTA ——— */}
        <section className="banner-hero relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-20 text-center">
          <Image
            src={HERO_IMAGE}
            alt="Team collaboration and business growth"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="banner-overlay" aria-hidden />
          <div className="relative z-10 mx-auto max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">
              For startups &amp; MSMEs
            </p>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Find government schemes
              <br />
              <span className="text-blue-300">you&apos;re eligible for</span>
            </h1>
            <p className="mx-auto mt-8 max-w-lg text-lg leading-relaxed text-slate-200">
              One short form. A clear list of subsidies, loans, and grants that match your business. No jargon.
            </p>
            <div className="mt-12">
              <Link
                href="/eligibility"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-8 py-4 text-base font-semibold text-white shadow-xl shadow-[var(--primary)]/40 transition-all duration-300 hover:scale-[1.03] hover:bg-[var(--primary-hover)] hover:shadow-2xl hover:shadow-[var(--primary)]/50"
              >
                Check my eligibility
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
          <a href="#why" className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-slate-300 transition hover:text-white" aria-label="Scroll down">
            <svg className="h-8 w-8 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </a>
        </section>

        {/* ——— Why us — content-sized ——— */}
        <section id="why" className="flex flex-col items-center justify-center border-t border-[var(--border)] bg-[var(--card)] py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-[var(--primary)]">Why SchemeMatch</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Schemes are scattered. We bring them together.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[var(--muted)]">
              Different ministries, banks, and state portals — each with different rules and deadlines. Most founders never find out what they qualify for.
            </p>
            <p className="mx-auto mt-4 text-[var(--muted)]">
              One questionnaire. One dashboard. A clear list of schemes that match your business.
            </p>
          </div>
        </section>

        {/* ——— What you're missing — cards with icons ——— */}
        <section id="missing" className="flex flex-col items-center justify-center border-t border-[var(--border)] bg-[var(--background)] py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <p className="text-center text-sm font-semibold uppercase tracking-widest text-[var(--primary)]">What you might be missing</p>
            <h2 className="mt-4 text-center text-3xl font-bold tracking-tight sm:text-4xl">
              Subsidies, loans, and grants — on the table
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-center text-lg text-[var(--muted)]">
              Many businesses leave money behind because they never checked.
            </p>
            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { Icon: IconSubsidy, title: "Credit-linked subsidies", desc: "Margin money and capital support" },
                { Icon: IconLoan, title: "Small-ticket loans", desc: "e.g. MUDRA, often without collateral" },
                { Icon: IconGrant, title: "State grants", desc: "State-specific incentives and one-time grants" },
                { Icon: IconCheck, title: "Guarantee schemes", desc: "Reduce bank risk, easier approval" },
              ].map(({ Icon, title, desc }) => (
                <div
                  key={title}
                  className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:border-[var(--primary)]/30 hover:shadow-xl hover:shadow-[var(--primary)]/10"
                >
                  <div className="absolute right-0 top-0 h-24 w-24 translate-x-4 -translate-y-4 rounded-full bg-[var(--primary)]/10 transition-transform group-hover:scale-150" />
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary)]/15 text-[var(--primary)] transition-colors group-hover:bg-[var(--primary)]/25">
                    <Icon />
                  </div>
                  <h3 className="relative mt-6 text-lg font-semibold text-[var(--foreground)]">{title}</h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-[var(--muted)]">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ——— Testimonials ——— */}
        <section className="flex flex-col items-center justify-center border-t border-[var(--border)] bg-[var(--card)] py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <p className="text-center text-sm font-semibold uppercase tracking-widest text-[var(--primary)]">Testimonials</p>
            <h2 className="mt-4 text-center text-3xl font-bold tracking-tight sm:text-4xl">
              What founders say
            </h2>
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {[
                { quote: "Finally understood which schemes I can actually apply for. Saved hours of searching.", who: "Founder, small manufacturing" },
                { quote: "Clear list of documents and timeline. Made the application process less daunting.", who: "MSME, services sector" },
                { quote: "Got matched with a scheme I hadn't heard of. Applied and got the subsidy.", who: "Startup, technology" },
              ].map((t) => (
                <blockquote key={t.who} className="relative rounded-2xl border border-[var(--border)] bg-[var(--background)]/80 p-8 shadow-md backdrop-blur-sm">
                  <IconQuote />
                  <p className="mt-4 text-[var(--foreground)] leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                  <footer className="mt-6 text-sm font-medium text-[var(--muted)]">— {t.who}</footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        {/* ——— How it works + CTA ——— */}
        <section id="how-it-works" className="flex flex-col items-center justify-center border-t border-[var(--border)] bg-[var(--background)] py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <p className="text-center text-sm font-semibold uppercase tracking-widest text-[var(--primary)]">How it works</p>
            <h2 className="mt-4 text-center text-3xl font-bold tracking-tight sm:text-4xl">
              Simple, transparent, built for busy founders
            </h2>
            <div className="mt-20 grid gap-12 sm:grid-cols-3 sm:gap-8">
              {[
                { n: "1", title: "Answer a few questions", body: "Business type, industry, location, turnover — we match you to the right schemes." },
                { n: "2", title: "See your matches", body: "A clear dashboard of eligible schemes with benefits and what you need to apply." },
                { n: "3", title: "Apply with confidence", body: "Start applications, track status, and get help from an advisor when you need it." },
              ].map((item) => (
                <div key={item.n} className="text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--primary)] text-3xl font-bold text-[var(--primary-foreground)] shadow-xl shadow-[var(--primary)]/25">
                    {item.n}
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-[var(--foreground)]">{item.title}</h3>
                  <p className="mt-3 text-[var(--muted)]">{item.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-16 text-center">
              <Link
                href="/eligibility"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-8 py-4 text-base font-semibold text-[var(--primary-foreground)] shadow-xl shadow-[var(--primary)]/25 transition-all duration-300 hover:scale-[1.03] hover:bg-[var(--primary-hover)] hover:shadow-2xl"
              >
                Check my eligibility
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border)] bg-[var(--card)] py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <p className="text-center text-sm text-[var(--muted)] sm:text-left">
              SchemeMatch — Eligibility discovery for government schemes and loans.
            </p>
            <Link href="/eligibility" className="text-sm font-semibold text-[var(--primary)] hover:underline">
              Check eligibility →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
