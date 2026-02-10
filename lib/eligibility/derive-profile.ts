import type { BusinessProfile } from "@/lib/db/types";
import type { Step1FormData, StartupFormData, MSMEFormData } from "./questions";

/** Map active_year value to company_age range string used by eligibility engine. */
function activeYearToCompanyAge(activeYear: string): string {
  const map: Record<string, string> = {
    "2024": "0-1",
    "2023": "0-1",
    "2022": "1-3",
    "2021": "1-3",
    "2020": "3-5",
    "2019": "3-5",
    "2018": "3-5",
    "2015-2017": "5-10",
    "2010-2014": "5-10",
    "before_2010": "10+",
  };
  return map[activeYear] ?? "1-3";
}

/** Map step1 turnover to turnover_range in lakhs for engine. */
function turnoverToRange(turnover: string): string {
  const map: Record<string, string> = {
    pre_revenue: "0-0",
    under_1cr: "0-100",
    "1_5cr": "100-500",
    "5_50cr": "500-5000",
    "50_250cr": "5000-25000",
    over_250cr: "25000-99999",
  };
  return map[turnover] ?? "0-100";
}

/** Derive business_type: Startup vs Micro / Small / Medium (MSME). Ineligible not stored; engine can still match. */
function deriveBusinessType(data: Step1FormData): "startup" | "micro" | "small" | "medium" {
  const { recognition_status, turnover } = data;
  // DPIIT or Both → treat as startup for scheme matching
  if (recognition_status === "dpiit" || recognition_status === "both") {
    return "startup";
  }
  // Udyam or None: classify by turnover (MSME definitions)
  switch (turnover) {
    case "pre_revenue":
    case "under_1cr":
      return "micro";
    case "1_5cr":
      return "small";
    case "5_50cr":
    case "50_250cr":
      return "medium";
    case "over_250cr":
    default:
      return "medium"; // engine may filter by turnover_max
  }
}

/** Map sector + sub_sector to single industry string for engine. */
function deriveIndustry(data: Step1FormData): string {
  const sectorMap: Record<string, string> = {
    agriculture_food: "Agriculture",
    manufacturing: "Manufacturing",
    services: "Services",
    technology_saas: "Technology",
    deeptech_rd: "Technology",
    trading: "Trading",
  };
  return sectorMap[data.sector] ?? "Services";
}

/** Primary support type → funding_goal for engine. */
function deriveFundingGoal(data: Step1FormData): "loan" | "subsidy" | "grant" | "any" {
  const support = data.support_types ?? [];
  if (support.length === 0) return "any";
  const first = support[0];
  if (first === "grant_subsidy") return "grant";
  if (first === "interest_subsidy") return "subsidy";
  if (
    first === "collateral_free_loan" ||
    first === "bank_loan" ||
    first === "equity_seed"
  ) {
    return "loan";
  }
  if (first === "export_market" || first === "patent_ip") return "any";
  return "any";
}

// ——— Startup flow derivation ———
function startupCapitalToTurnoverRange(capital: string): string {
  const map: Record<string, string> = {
    under_10l: "0-10",
    "10_50l": "10-50",
    "50l_2cr": "50-200",
    "2_10cr": "200-1000",
    over_10cr: "1000-9999",
  };
  return map[capital] ?? "0-10";
}

function startupSectorToIndustry(sector: string): string {
  const map: Record<string, string> = {
    technology_saas: "Technology",
    deeptech_rd: "Technology",
    manufacturing: "Manufacturing",
    agriculture_food: "Agriculture",
    healthcare: "Services",
    fintech_edtech: "Technology",
    other: "Services",
  };
  return map[sector] ?? "Technology";
}

function grantVsEquityToFundingGoal(pref: string): "loan" | "subsidy" | "grant" | "any" {
  if (pref === "grant") return "grant";
  if (pref === "debt") return "loan";
  return "any";
}

/**
 * Derive engine profile from Startup questionnaire (S1–S12).
 */
export function deriveStartupProfile(
  data: Partial<StartupFormData>,
  profileId?: string,
  userId?: string
): Omit<BusinessProfile, "id" | "user_id"> & { id?: string; user_id?: string } {
  const capital = typeof data?.capital_requirement === "string" ? data.capital_requirement : "under_10l";
  const sector = typeof data?.sector_focus === "string" ? data.sector_focus : "other";
  const pref = typeof data?.grant_vs_equity_preference === "string" ? data.grant_vs_equity_preference : "both";
  const startupAge = typeof data?.startup_age === "string" ? data.startup_age : "1-3";
  return {
    ...(profileId && { id: profileId }),
    ...(userId && { user_id: userId }),
    business_type: "startup",
    industry: startupSectorToIndustry(sector),
    state: "Other",
    turnover_range: startupCapitalToTurnoverRange(capital),
    company_age: startupAge,
    funding_goal: grantVsEquityToFundingGoal(pref),
  };
}

// ——— MSME flow derivation ———
function msmeTurnoverToRange(turnover: string): string {
  const map: Record<string, string> = {
    pre_revenue: "0-0",
    under_1cr: "0-100",
    "1_5cr": "100-500",
    "5_50cr": "500-5000",
    "50_250cr": "5000-25000",
    over_250cr: "25000-99999",
  };
  return map[turnover] ?? "0-100";
}

function msmeNatureToIndustry(nature: string): string {
  const map: Record<string, string> = {
    manufacturing: "Manufacturing",
    services: "Services",
    trading: "Trading",
    mixed: "Services",
  };
  return map[nature] ?? "Services";
}

/**
 * Derive engine profile from MSME questionnaire (M1–M12).
 */
export function deriveMSMEProfile(
  data: Partial<MSMEFormData>,
  profileId?: string,
  userId?: string
): Omit<BusinessProfile, "id" | "user_id"> & { id?: string; user_id?: string } {
  const udyam = typeof data?.udyam_classification === "string" ? data.udyam_classification : "not_registered";
  const turnover = typeof data?.annual_turnover === "string" ? data.annual_turnover : "under_1cr";
  const nature = typeof data?.nature_of_business_activity === "string" ? data.nature_of_business_activity : "services";
  const subvention = typeof data?.interest_subvention_requirement === "string" ? data.interest_subvention_requirement : "no";
  let business_type: "micro" | "small" | "medium" = "micro";
  if (udyam === "small") business_type = "small";
  else if (udyam === "medium") business_type = "medium";
  else if (udyam === "not_registered") {
    if (turnover === "1_5cr") business_type = "small";
    else if (turnover === "5_50cr" || turnover === "50_250cr" || turnover === "over_250cr") business_type = "medium";
  }
  const funding_goal = subvention === "yes" || subvention === "prefer" ? "subsidy" : "any";
  return {
    ...(profileId && { id: profileId }),
    ...(userId && { user_id: userId }),
    business_type,
    industry: msmeNatureToIndustry(nature),
    state: "Other",
    turnover_range: msmeTurnoverToRange(turnover),
    company_age: "1-3",
    funding_goal,
  };
}

/**
 * Derive engine profile (business_type, industry, state, turnover_range, company_age, funding_goal)
 * from step 1 form data. Used for scheme matching and for saving to pending_profiles (legacy / onboarding).
 */
export function deriveProfileFromStep1(
  data: Partial<Step1FormData>,
  profileId?: string,
  userId?: string
): Omit<BusinessProfile, "id" | "user_id"> & { id?: string; user_id?: string } {
  const business_type = deriveBusinessType(data as Step1FormData);
  const industry = deriveIndustry(data as Step1FormData);
  const state = (data.state ?? "Other").trim() || "Other";
  const turnover_range = turnoverToRange(data.turnover ?? "under_1cr");
  const company_age = activeYearToCompanyAge(data.active_year ?? "2023");
  const funding_goal = deriveFundingGoal(data as Step1FormData);

  return {
    ...(profileId && { id: profileId }),
    ...(userId && { user_id: userId }),
    business_type,
    industry,
    state,
    turnover_range,
    company_age,
    funding_goal,
  };
}
