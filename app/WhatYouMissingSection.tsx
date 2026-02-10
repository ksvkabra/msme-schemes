const CATEGORIES = [
  {
    id: "subsidy",
    title: "Credit-linked subsidies",
    desc: "Margin money and capital support",
    schemes: [
      { name: "PMEGP", detail: "Margin money subsidy for new units" },
      { name: "CLCSS", detail: "Capital subsidy for technology upgradation" },
      { name: "ISEC", detail: "Interest subsidy eligibility certificate" },
      { name: "Margin Money Scheme", detail: "Up to 25% of project cost" },
    ],
  },
  {
    id: "loan",
    title: "Small-ticket loans",
    desc: "e.g. MUDRA, often without collateral",
    schemes: [
      { name: "MUDRA Shishu", detail: "Loans up to ₹50,000" },
      { name: "MUDRA Kishore", detail: "Loans ₹50,000 – ₹5 lakh" },
      { name: "MUDRA Tarun", detail: "Loans ₹5 lakh – ₹10 lakh" },
      { name: "SIDBI 59 Minute Loan", detail: "Quick in-principle approval" },
      { name: "Stand-Up India", detail: "SC/ST and women entrepreneurs" },
    ],
  },
  {
    id: "grant",
    title: "State grants",
    desc: "State-specific incentives and one-time grants",
    schemes: [
      { name: "State Capital Subsidy", detail: "One-time capital investment support" },
      { name: "State Interest Subsidy", detail: "Interest subvention on term loans" },
      { name: "SGST Reimbursement", detail: "Refund on state GST for new units" },
      { name: "Single Window Incentive", detail: "Combined state benefits" },
    ],
  },
  {
    id: "guarantee",
    title: "Guarantee schemes",
    desc: "Reduce bank risk, easier approval",
    schemes: [
      { name: "CGTMSE", detail: "Collateral-free loans for MSMEs" },
      { name: "CGTSI", detail: "Credit guarantee for tech upgradation" },
      { name: "State Guarantee Schemes", detail: "State-backed loan guarantees" },
    ],
  },
] as const;

export function WhatYouMissingSection() {
  return (
    <section
      id="missing"
      className="flex flex-col items-center justify-center rounded-2xl bg-[var(--card)] py-16 sm:py-20"
    >
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
        <p className="text-center text-sm font-semibold uppercase tracking-widest text-[var(--primary)]">
          What you might be missing
        </p>
        <h2 className="mt-4 text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Subsidies, loans, and grants — on the table
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg text-[var(--muted)]">
          Many businesses leave money behind because they never checked.
        </p>

        <div className="mt-14 flex flex-col gap-10 sm:gap-12">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="rounded-xl border border-[var(--border)] bg-[var(--background)]/40 p-6 sm:p-8"
            >
              <h3 className="text-lg font-semibold text-[var(--foreground)]">{cat.title}</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">{cat.desc}</p>
              <ul className="mt-6 space-y-3">
                {cat.schemes.map((s) => (
                  <li
                    key={s.name}
                    className="flex flex-col gap-0.5 border-b border-[var(--border)]/60 pb-3 last:border-0 last:pb-0"
                  >
                    <span className="font-medium text-[var(--foreground)]">{s.name}</span>
                    <span className="text-sm text-[var(--muted)]">{s.detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
