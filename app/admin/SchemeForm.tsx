"use client";

import { useState } from "react";
import type { EligibilityRules } from "@/lib/db/types";

const BUSINESS_TYPES = ["micro", "small", "medium", "startup"] as const;
const FUNDING_TYPES = ["loan", "subsidy", "grant"] as const;
const SCHEME_TYPES = ["loan", "subsidy", "grant"] as const;

type SchemeFormData = {
  name: string;
  type: string;
  benefit_summary: string;
  key_benefit_display: string;
  required_documents: string[];
  estimated_timeline: string;
  states_applicable: string[];
  eligibility_rules: EligibilityRules;
};

function rulesToForm(r: EligibilityRules | null | undefined): EligibilityRules {
  if (!r || typeof r !== "object") return {};
  return {
    business_types: r.business_types ?? [],
    industries: r.industries ?? [],
    states: r.states ?? [],
    turnover_min: r.turnover_min ?? undefined,
    turnover_max: r.turnover_max ?? undefined,
    company_age_min_years: r.company_age_min_years ?? undefined,
    company_age_max_years: r.company_age_max_years ?? undefined,
    funding_types: r.funding_types ?? [],
  };
}

export function SchemeForm({
  schemeId,
  initial,
  onSuccess,
}: {
  schemeId?: string;
  initial?: Partial<SchemeFormData>;
  onSuccess: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState(initial?.type ?? "loan");
  const [benefit_summary, setBenefitSummary] = useState(initial?.benefit_summary ?? "");
  const [key_benefit_display, setKeyBenefitDisplay] = useState(initial?.key_benefit_display ?? "");
  const [required_documents, setRequiredDocuments] = useState<string[]>(initial?.required_documents ?? []);
  const [estimated_timeline, setEstimatedTimeline] = useState(initial?.estimated_timeline ?? "");
  const [states_applicable, setStatesApplicable] = useState<string[]>(initial?.states_applicable ?? []);
  const rules = rulesToForm(initial?.eligibility_rules);
  const [business_types, setBusinessTypes] = useState<string[]>(rules.business_types ?? []);
  const [industries, setIndustries] = useState<string[]>(rules.industries ?? []);
  const [statesRules, setStatesRules] = useState<string[]>(rules.states ?? []);
  const [turnover_min, setTurnoverMin] = useState<string>(rules.turnover_min != null ? String(rules.turnover_min) : "");
  const [turnover_max, setTurnoverMax] = useState(rules.turnover_max != null ? String(rules.turnover_max) : "");
  const [company_age_min_years, setCompanyAgeMinYears] = useState(rules.company_age_min_years != null ? String(rules.company_age_min_years) : "");
  const [company_age_max_years, setCompanyAgeMaxYears] = useState(rules.company_age_max_years != null ? String(rules.company_age_max_years) : "");
  const [funding_types, setFundingTypes] = useState<string[]>(rules.funding_types ?? []);

  const toggleArray = (arr: string[], val: string, set: (a: string[]) => void) => {
    if (arr.includes(val)) set(arr.filter((x) => x !== val));
    else set([...arr, val]);
  };

  const buildPayload = () => {
    const eligibility_rules: EligibilityRules = {};
    if (business_types.length) eligibility_rules.business_types = business_types as ("micro" | "small" | "medium" | "startup")[];
    if (industries.length) eligibility_rules.industries = industries;
    if (statesRules.length) eligibility_rules.states = statesRules;
    const tMin = turnover_min.trim() ? parseFloat(turnover_min) : undefined;
    const tMax = turnover_max.trim() ? parseFloat(turnover_max) : undefined;
    if (tMin != null && !Number.isNaN(tMin)) eligibility_rules.turnover_min = tMin;
    if (tMax != null && !Number.isNaN(tMax)) eligibility_rules.turnover_max = tMax;
    const cMin = company_age_min_years.trim() ? parseFloat(company_age_min_years) : undefined;
    const cMax = company_age_max_years.trim() ? parseFloat(company_age_max_years) : undefined;
    if (cMin != null && !Number.isNaN(cMin)) eligibility_rules.company_age_min_years = cMin;
    if (cMax != null && !Number.isNaN(cMax)) eligibility_rules.company_age_max_years = cMax;
    if (funding_types.length) eligibility_rules.funding_types = funding_types as ("loan" | "subsidy" | "grant")[];

    return {
      name: name.trim(),
      type: type.trim(),
      benefit_summary: benefit_summary.trim(),
      key_benefit_display: key_benefit_display.trim() || null,
      required_documents,
      estimated_timeline: estimated_timeline.trim() || null,
      states_applicable: states_applicable.length ? states_applicable : null,
      eligibility_rules,
    };
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const payload = buildPayload();
      const url = schemeId ? `/api/admin/schemes/${schemeId}` : "/api/admin/schemes";
      const method = schemeId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(j.error ?? "Request failed");
        return;
      }
      onSuccess();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
          {error}
        </div>
      )}

      <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Basic info</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
            >
              {SCHEME_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]">Benefit summary</label>
            <textarea
              value={benefit_summary}
              onChange={(e) => setBenefitSummary(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]">Key benefit (short display)</label>
            <input
              type="text"
              value={key_benefit_display}
              onChange={(e) => setKeyBenefitDisplay(e.target.value)}
              placeholder="e.g. Up to ₹50L or 25% subsidy"
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]">Required documents (one per line)</label>
            <textarea
              value={required_documents.join("\n")}
              onChange={(e) => setRequiredDocuments(e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))}
              rows={3}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]">Estimated timeline</label>
            <input
              type="text"
              value={estimated_timeline}
              onChange={(e) => setEstimatedTimeline(e.target.value)}
              placeholder="e.g. 4–6 weeks from application"
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]">States applicable (one per line; use * for all)</label>
            <textarea
              value={states_applicable.join("\n")}
              onChange={(e) => setStatesApplicable(e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))}
              rows={2}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
            />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Eligibility rules</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">Configure who can match this scheme. Leave empty for no restriction.</p>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]">Business types</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {BUSINESS_TYPES.map((t) => (
                <label key={t} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={business_types.includes(t)}
                    onChange={() => toggleArray(business_types, t, setBusinessTypes)}
                  />
                  <span>{t}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]">Industries (one per line)</label>
            <textarea
              value={industries.join("\n")}
              onChange={(e) => setIndustries(e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))}
              rows={2}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]">States in rules (one per line; * for all)</label>
            <textarea
              value={statesRules.join("\n")}
              onChange={(e) => setStatesRules(e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))}
              rows={2}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)]">Turnover min (lakhs)</label>
              <input
                type="number"
                step="any"
                value={turnover_min}
                onChange={(e) => setTurnoverMin(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)]">Turnover max (lakhs)</label>
              <input
                type="number"
                step="any"
                value={turnover_max}
                onChange={(e) => setTurnoverMax(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)]">Company age min (years)</label>
              <input
                type="number"
                step="any"
                value={company_age_min_years}
                onChange={(e) => setCompanyAgeMinYears(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)]">Company age max (years)</label>
              <input
                type="number"
                step="any"
                value={company_age_max_years}
                onChange={(e) => setCompanyAgeMaxYears(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]">Funding types</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {FUNDING_TYPES.map((t) => (
                <label key={t} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={funding_types.includes(t)}
                    onChange={() => toggleArray(funding_types, t, setFundingTypes)}
                  />
                  <span>{t}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "Saving…" : schemeId ? "Update scheme" : "Create scheme"}
        </button>
        <a
          href="/admin"
          className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-semibold hover:bg-[var(--background)]"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
