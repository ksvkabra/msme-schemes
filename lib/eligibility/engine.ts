import type { BusinessProfile, Scheme, EligibilityRules } from "@/lib/db/types";

/** Parse turnover_range string (e.g. "0-50" lakhs, "1-5" crore) to a single numeric in lakhs for comparison. */
function parseTurnoverLakhs(turnoverRange: string): number {
  const s = turnoverRange.trim();
  const match = s.match(/^(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)$/) ?? s.match(/^(\d+(?:\.\d+)?)$/);
  if (!match) return 0;
  const high = parseFloat(match[match.length - 1]);
  const low = parseFloat(match[1]);
  return (high + low) / 2;
}

/** Parse company_age string (e.g. "0-3" years) to max years. */
function parseCompanyAgeYears(companyAge: string): number {
  const s = companyAge.trim();
  const match = s.match(/(\d+(?:\.\d+)?)/g);
  if (!match || match.length === 0) return 0;
  const nums = match.map(Number);
  return Math.max(...nums);
}

/** Deterministic eligibility: compare profile to scheme rules; return score 0–100 and missing requirements. */
export function evaluateEligibility(
  profile: BusinessProfile,
  scheme: Scheme
): { eligible: boolean; score: number; missingRequirements: string[] } {
  const rules = scheme.eligibility_rules as EligibilityRules;
  const missing: string[] = [];
  let score = 100;

  if (rules.business_types?.length) {
    const ok = rules.business_types.includes(profile.business_type as "micro" | "small" | "medium" | "startup");
    if (!ok) {
      missing.push(`Business type must be one of: ${rules.business_types.join(", ")}`);
      score -= 25;
    }
  }

  if (rules.industries?.length) {
    const ok = rules.industries.some(
      (i) => i.toLowerCase() === profile.industry.toLowerCase()
    );
    if (!ok) {
      missing.push(`Industry must be one of: ${rules.industries.join(", ")}`);
      score -= 20;
    }
  }

  const statesApplicable = rules.states ?? scheme.states_applicable ?? [];
  if (statesApplicable.length && !statesApplicable.includes("*")) {
    const ok = statesApplicable.some(
      (s) => s.toLowerCase() === profile.state.toLowerCase()
    );
    if (!ok) {
      missing.push(`State must be one of: ${statesApplicable.join(", ")}`);
      score -= 25;
    }
  }

  if (rules.turnover_max != null) {
    const turnoverLakhs = parseTurnoverLakhs(profile.turnover_range);
    if (turnoverLakhs > rules.turnover_max) {
      missing.push(`Turnover must be at most ${rules.turnover_max} (lakhs)`);
      score -= 15;
    }
  }
  if (rules.turnover_min != null) {
    const turnoverLakhs = parseTurnoverLakhs(profile.turnover_range);
    if (turnoverLakhs < rules.turnover_min) {
      missing.push(`Turnover must be at least ${rules.turnover_min} (lakhs)`);
      score -= 15;
    }
  }

  if (rules.company_age_max_years != null) {
    const ageYears = parseCompanyAgeYears(profile.company_age);
    if (ageYears > rules.company_age_max_years) {
      missing.push(`Company age must be at most ${rules.company_age_max_years} years`);
      score -= 15;
    }
  }
  if (rules.company_age_min_years != null) {
    const ageYears = parseCompanyAgeYears(profile.company_age);
    if (ageYears < rules.company_age_min_years) {
      missing.push(`Company age must be at least ${rules.company_age_min_years} years`);
      score -= 15;
    }
  }

  const finalScore = Math.max(0, score);
  return {
    eligible: missing.length === 0,
    score: finalScore,
    missingRequirements: missing,
  };
}

/** Match all schemes for a profile; return sorted by score. */
export function matchSchemes(
  profile: BusinessProfile,
  schemes: Scheme[]
): Array<{ scheme: Scheme; score: number; missingRequirements: string[] }> {
  const results = schemes.map((scheme) => {
    const { score, missingRequirements } = evaluateEligibility(profile, scheme);
    return { scheme, score, missingRequirements };
  });
  results.sort((a, b) => b.score - a.score);
  return results;
}
