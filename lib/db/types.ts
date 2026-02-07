/** Database row types and eligibility rule shape for schemes. */

export type BusinessType = "micro" | "small" | "medium" | "startup";
export type ApplicationStatus = "draft" | "submitted" | "under_review" | "approved" | "rejected";

export type FundingType = "loan" | "subsidy" | "grant";

export interface EligibilityRules {
  business_types?: BusinessType[];
  industries?: string[];
  states?: string[];
  turnover_min?: number;
  turnover_max?: number;
  company_age_min_years?: number;
  company_age_max_years?: number;
  funding_types?: FundingType[];
  [key: string]: unknown;
}

export type FundingGoal = "loan" | "subsidy" | "grant" | "any";

export interface BusinessProfile {
  id: string;
  user_id: string;
  business_type: BusinessType;
  industry: string;
  state: string;
  turnover_range: string;
  company_age: string;
  funding_goal?: FundingGoal | null;
  created_at?: string;
  updated_at?: string;
}

export interface Scheme {
  id: string;
  name: string;
  type: string;
  eligibility_rules: EligibilityRules;
  benefit_summary: string;
  states_applicable: string[] | null;
  key_benefit_display?: string | null;
  required_documents?: string[] | null;
  estimated_timeline?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UserSchemeMatch {
  id?: string;
  user_id: string;
  scheme_id: string;
  match_score: number;
  missing_requirements: string[];
  created_at?: string;
}

export interface Application {
  id: string;
  user_id: string;
  scheme_id: string;
  status: ApplicationStatus;
  bank_name: string | null;
  created_at?: string;
  updated_at?: string;
}
