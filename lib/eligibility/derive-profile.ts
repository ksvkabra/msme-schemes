import type { BusinessProfile } from "@/lib/db/types";
import type { Step1FormData } from "./questions";

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

/**
 * Derive engine profile (business_type, industry, state, turnover_range, company_age, funding_goal)
 * from step 1 form data. Used for scheme matching and for saving to pending_profiles.
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
