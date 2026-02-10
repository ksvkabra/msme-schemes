/**
 * Gateway: Startup vs MSME.
 * Then either STARTUP_QUESTIONS (S1–S12) or MSME_QUESTIONS (M1–M12).
 * STEP1_QUESTIONS / STEP2_QUESTIONS kept for backward compatibility where needed.
 */

export type EntityType = "startup" | "msme";

/** Options for a single-select or multi-select step. */
export interface QuestionOption {
  value: string;
  label: string;
}

export interface QuestionnaireStep {
  key: string;
  title: string;
  subtitle?: string;
  options: QuestionOption[];
  multi?: boolean;
  maxSelections?: number;
}

/** Get display label for a question value. */
export function getOptionLabel(step: QuestionnaireStep, value: string): string {
  const opt = step.options.find((o) => o.value === value);
  return opt?.label ?? value;
}

export type QuestionnaireSummaryRow = { title: string; label: string };

/** Build summary rows for display from stored entity_type + questionnaire_responses + step2_responses. */
export function buildQuestionnaireSummaryRows(
  entityType: "startup" | "msme" | null | undefined,
  questionnaireResponses: Record<string, unknown> | null | undefined,
  step2Responses: Record<string, unknown> | null | undefined
): QuestionnaireSummaryRow[] {
  const rows: QuestionnaireSummaryRow[] = [];
  if (entityType) {
    rows.push({
      title: GATEWAY_QUESTION.title,
      label: getOptionLabel(GATEWAY_QUESTION, entityType),
    });
  }
  const flowQuestions = entityType === "startup" ? STARTUP_QUESTIONS : entityType === "msme" ? MSME_QUESTIONS : [];
  const responses = questionnaireResponses ?? {};
  for (const q of flowQuestions) {
    const val = responses[q.key];
    if (val != null && val !== "") {
      const label =
        typeof val === "string"
          ? getOptionLabel(q, val)
          : Array.isArray(val)
            ? val.map((v) => getOptionLabel(q, String(v))).join(", ")
            : String(val);
      rows.push({ title: q.title, label });
    }
  }
  const step2 = step2Responses ?? {};
  for (const q of STEP2_QUESTIONS) {
    const val = step2[q.key];
    if (val != null && val !== "") {
      rows.push({ title: q.title, label: getOptionLabel(q, String(val)) });
    }
  }
  return rows;
}

// ——— Gateway: Entity Classification ———
export const GATEWAY_QUESTION: QuestionnaireStep = {
  key: "entity_type",
  title: "How would you classify your entity?",
  subtitle: "We’ll show you a short questionnaire tailored to your path.",
  options: [
    { value: "startup", label: "Startup" },
    { value: "msme", label: "MSME" },
  ],
};

// ——— STARTUP FLOW (S1–S12) ———
export type StartupFormData = Record<string, string | string[]>;

export const STARTUP_QUESTIONS: QuestionnaireStep[] = [
  {
    key: "dpiit_recognition_status",
    title: "DPIIT Recognition Status",
    subtitle: "Do you have DPIIT Startup Recognition?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "applied", label: "Applied" },
      { value: "no", label: "No" },
      { value: "not_eligible", label: "Not Eligible" },
    ],
  },
  {
    key: "startup_age",
    title: "Startup Age",
    subtitle: "Years since incorporation / registration",
    options: [
      { value: "0-1", label: "Less than 1 year" },
      { value: "1-3", label: "1–3 years" },
      { value: "3-5", label: "3–5 years" },
      { value: "5-7", label: "5–7 years" },
      { value: "7+", label: "More than 7 years" },
    ],
  },
  {
    key: "innovation_type",
    title: "Innovation Type",
    subtitle: "What best describes your innovation?",
    options: [
      { value: "product", label: "Product innovation" },
      { value: "process", label: "Process innovation" },
      { value: "business_model", label: "Business model innovation" },
      { value: "tech_driven", label: "Technology-driven" },
      { value: "none", label: "Not innovation-focused" },
    ],
  },
  {
    key: "technology_ip_orientation",
    title: "Technology / IP Orientation",
    subtitle: "Do you have or plan IP (patents, etc.)?",
    options: [
      { value: "patent_filed", label: "Patent(s) filed" },
      { value: "patent_planned", label: "Patent planned" },
      { value: "ip_other", label: "Other IP (trademark, design)" },
      { value: "no_ip", label: "No IP / not applicable" },
    ],
  },
  {
    key: "sector_focus",
    title: "Sector Focus",
    subtitle: "Primary sector of operation",
    options: [
      { value: "technology_saas", label: "Technology / SaaS / IT" },
      { value: "deeptech_rd", label: "DeepTech / R&D" },
      { value: "manufacturing", label: "Manufacturing" },
      { value: "agriculture_food", label: "Agriculture / Food" },
      { value: "healthcare", label: "Healthcare / Pharma" },
      { value: "fintech_edtech", label: "FinTech / EdTech" },
      { value: "other", label: "Other" },
    ],
  },
  {
    key: "funding_stage",
    title: "Funding Stage",
    subtitle: "Current funding stage",
    options: [
      { value: "bootstrapped", label: "Bootstrapped / Pre-seed" },
      { value: "seed", label: "Seed" },
      { value: "series_a", label: "Series A" },
      { value: "series_b_plus", label: "Series B+" },
      { value: "revenue_no_external", label: "Revenue, no external funding" },
    ],
  },
  {
    key: "capital_requirement",
    title: "Capital Requirement",
    subtitle: "Approximate funding requirement",
    options: [
      { value: "under_10l", label: "< ₹10 L" },
      { value: "10_50l", label: "₹10–50 L" },
      { value: "50l_2cr", label: "₹50 L – 2 Cr" },
      { value: "2_10cr", label: "₹2 – 10 Cr" },
      { value: "over_10cr", label: "> ₹10 Cr" },
    ],
  },
  {
    key: "grant_vs_equity_preference",
    title: "Grant vs Equity Preference",
    subtitle: "What type of support are you seeking?",
    options: [
      { value: "grant", label: "Grant / non-dilutive" },
      { value: "equity", label: "Equity / dilutive" },
      { value: "both", label: "Both" },
      { value: "debt", label: "Debt / loan" },
    ],
  },
  {
    key: "incubation_accelerator_status",
    title: "Incubation / Accelerator Status",
    subtitle: "Are you or have you been part of an incubator or accelerator?",
    options: [
      { value: "currently_incubated", label: "Currently incubated" },
      { value: "graduated", label: "Graduated" },
      { value: "applied", label: "Applied / in process" },
      { value: "no", label: "No" },
    ],
  },
  {
    key: "fund_of_funds_aif_openness",
    title: "Fund-of-Funds / AIF Openness",
    subtitle: "Would you consider fund-of-funds or AIF schemes?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "maybe", label: "Maybe / need to know more" },
      { value: "no", label: "No" },
    ],
  },
  {
    key: "export_global_market_focus",
    title: "Export / Global Market Focus",
    subtitle: "Is your business export-oriented or targeting global markets?",
    options: [
      { value: "yes_exporting", label: "Yes, already exporting" },
      { value: "planning", label: "Planning to export" },
      { value: "domestic_only", label: "Domestic only" },
    ],
  },
  {
    key: "strategic_social_impact_alignment",
    title: "Strategic / Social Impact Alignment",
    subtitle: "Does your startup align with any of these?",
    options: [
      { value: "social_impact", label: "Social impact / inclusion" },
      { value: "strategic_sector", label: "Strategic sector (defence, space, etc.)" },
      { value: "rural_employment", label: "Rural / employment focus" },
      { value: "none", label: "None of these" },
    ],
  },
];

// ——— MSME FLOW (M1–M12) ———
export type MSMEFormData = Record<string, string>;

export const MSME_QUESTIONS: QuestionnaireStep[] = [
  {
    key: "udyam_classification",
    title: "Udyam Classification",
    subtitle: "Your Udyam registration classification (if registered)",
    options: [
      { value: "micro", label: "Micro" },
      { value: "small", label: "Small" },
      { value: "medium", label: "Medium" },
      { value: "not_registered", label: "Not yet registered" },
    ],
  },
  {
    key: "annual_turnover",
    title: "Annual Turnover",
    subtitle: "Last financial year turnover",
    options: [
      { value: "pre_revenue", label: "Pre-revenue" },
      { value: "under_1cr", label: "< ₹1 Cr" },
      { value: "1_5cr", label: "₹1–5 Cr" },
      { value: "5_50cr", label: "₹5–50 Cr" },
      { value: "50_250cr", label: "₹50–250 Cr" },
      { value: "over_250cr", label: "> ₹250 Cr" },
    ],
  },
  {
    key: "investment_plant_machinery",
    title: "Investment in Plant & Machinery",
    subtitle: "Investment in plant, machinery or equipment",
    options: [
      { value: "under_1cr", label: "< ₹1 Cr" },
      { value: "1_10cr", label: "₹1–10 Cr" },
      { value: "10_50cr", label: "₹10–50 Cr" },
      { value: "over_50cr", label: "> ₹50 Cr" },
    ],
  },
  {
    key: "nature_of_business_activity",
    title: "Nature of Business Activity",
    subtitle: "Primary activity",
    options: [
      { value: "manufacturing", label: "Manufacturing" },
      { value: "services", label: "Services" },
      { value: "trading", label: "Trading" },
      { value: "mixed", label: "Mixed" },
    ],
  },
  {
    key: "location_district_incentives",
    title: "Location & District Incentives",
    subtitle: "Where is your unit located?",
    options: [
      { value: "north_east", label: "North-East" },
      { value: "aspirational_district", label: "Aspirational District" },
      { value: "rural", label: "Rural" },
      { value: "urban", label: "Urban / General" },
    ],
  },
  {
    key: "state_industrial_policy_coverage",
    title: "State Industrial Policy Coverage",
    subtitle: "Is your unit in a state with specific industrial incentives?",
    options: [
      { value: "yes_availing", label: "Yes, availing / eligible" },
      { value: "yes_not_availing", label: "Yes, but not availing" },
      { value: "no", label: "No / not sure" },
    ],
  },
  {
    key: "credit_exposure_status",
    title: "Credit Exposure Status",
    subtitle: "Existing bank / institutional credit?",
    options: [
      { value: "none", label: "No existing loan" },
      { value: "secured", label: "Yes, secured" },
      { value: "unsecured", label: "Yes, unsecured" },
    ],
  },
  {
    key: "interest_subvention_requirement",
    title: "Interest Subvention Requirement",
    subtitle: "Do you need interest subsidy / subvention?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "prefer", label: "Would prefer" },
      { value: "no", label: "No" },
    ],
  },
  {
    key: "capex_technology_upgradation_plan",
    title: "Capex / Technology Upgradation Plan",
    subtitle: "Planning capital expenditure or technology upgradation?",
    options: [
      { value: "yes_short_term", label: "Yes, in next 1–2 years" },
      { value: "yes_long_term", label: "Yes, later" },
      { value: "no", label: "No" },
    ],
  },
  {
    key: "export_activity_status",
    title: "Export Activity Status",
    subtitle: "Export orientation",
    options: [
      { value: "exporting", label: "Currently exporting" },
      { value: "planning", label: "Planning to export" },
      { value: "no", label: "No export" },
    ],
  },
  {
    key: "quality_compliance_certifications",
    title: "Quality & Compliance Certifications",
    subtitle: "Do you have or are you pursuing any?",
    options: [
      { value: "iso_other", label: "ISO / other quality certs" },
      { value: "gst_itr_ready", label: "GST + ITR compliant" },
      { value: "partial", label: "Partial compliance" },
      { value: "none", label: "None yet" },
    ],
  },
  {
    key: "employment_intensity",
    title: "Employment Intensity",
    subtitle: "Number of employees (approx.)",
    options: [
      { value: "1-5", label: "1–5" },
      { value: "6-20", label: "6–20" },
      { value: "21-50", label: "21–50" },
      { value: "51-100", label: "51–100" },
      { value: "100+", label: "100+" },
    ],
  },
];

// ——— Legacy: single flow (kept for onboarding / backward compat) ———
export type Step1FormData = {
  legal_entity_type: string;
  active_year: string;
  recognition_status: string;
  turnover: string;
  sector: string;
  sub_sector: string;
  state: string;
  location_advantage: string;
  ownership_category: string;
  stage: string;
  support_types: string[];
  funding_amount: string;
  compliance_readiness: string;
  innovation_ip_export: string;
};

/** Legacy Step 1: 12 questions (single flow). Still used by onboarding. */
export const STEP1_QUESTIONS: QuestionnaireStep[] = [
  { key: "legal_entity_type", title: "Legal Status & Age", subtitle: "What is the legal structure and year of incorporation?", options: [
    { value: "proprietorship", label: "Proprietorship" },
    { value: "partnership_llp", label: "Partnership / LLP" },
    { value: "private_limited_opc", label: "Private Limited / OPC" },
    { value: "society_trust", label: "Society / Trust" },
  ]},
  { key: "active_year", title: "Year of incorporation / registration", subtitle: "In which year did you incorporate or register?", options: [
    { value: "2024", label: "2024" }, { value: "2023", label: "2023" }, { value: "2022", label: "2022" }, { value: "2021", label: "2021" }, { value: "2020", label: "2020" }, { value: "2019", label: "2019" }, { value: "2018", label: "2018" }, { value: "2015-2017", label: "2015–2017" }, { value: "2010-2014", label: "2010–2014" }, { value: "before_2010", label: "Before 2010" },
  ]},
  { key: "recognition_status", title: "Recognition Status", subtitle: "Which registrations do you currently have?", options: [
    { value: "dpiit", label: "DPIIT Startup Recognition" }, { value: "udyam", label: "Udyam (MSME) Registration" }, { value: "both", label: "Both" }, { value: "none", label: "None" },
  ]},
  { key: "turnover", title: "Turnover (Last FY)", subtitle: "What is your annual turnover?", options: [
    { value: "pre_revenue", label: "Pre-revenue" }, { value: "under_1cr", label: "< ₹1 Cr" }, { value: "1_5cr", label: "₹1–5 Cr" }, { value: "5_50cr", label: "₹5–50 Cr" }, { value: "50_250cr", label: "₹50–250 Cr" }, { value: "over_250cr", label: "> ₹250 Cr" },
  ]},
  { key: "sector", title: "Sector of Operation", subtitle: "Which sector best describes your business?", options: [
    { value: "agriculture_food", label: "Agriculture / Food Processing" }, { value: "manufacturing", label: "Manufacturing" }, { value: "services", label: "Services" }, { value: "technology_saas", label: "Technology / SaaS / IT" }, { value: "deeptech_rd", label: "DeepTech / R&D / IP-based" }, { value: "trading", label: "Trading" },
  ]},
  { key: "sub_sector", title: "Sub-Sector (One Primary)", subtitle: "Your primary sub-sector", options: [
    { value: "electronics_ev_cleantech", label: "Electronics / EV / CleanTech" }, { value: "pharma_healthcare", label: "Pharma / Healthcare" }, { value: "textiles_apparel", label: "Textiles / Apparel" }, { value: "agritech_foodtech", label: "AgriTech / FoodTech" }, { value: "fintech_edtech", label: "FinTech / EdTech" }, { value: "defence_aerospace", label: "Defence / Aerospace" }, { value: "other", label: "Other" },
  ]},
  { key: "state", title: "Location — State", subtitle: "Where is the business primarily located?", options: [
    { value: "Maharashtra", label: "Maharashtra" }, { value: "Karnataka", label: "Karnataka" }, { value: "Gujarat", label: "Gujarat" }, { value: "Tamil Nadu", label: "Tamil Nadu" }, { value: "Delhi", label: "Delhi" }, { value: "Uttar Pradesh", label: "Uttar Pradesh" }, { value: "West Bengal", label: "West Bengal" }, { value: "Other", label: "Other" },
  ]},
  { key: "location_advantage", title: "Location Advantage", subtitle: "Area type", options: [
    { value: "ne_aspirational_rural", label: "North-East / Aspirational District / Rural" }, { value: "urban_general", label: "Urban / General" },
  ]},
  { key: "ownership_category", title: "Ownership Category", subtitle: "Does the business have majority ownership by any of the following?", options: [
    { value: "woman", label: "Woman Entrepreneur" }, { value: "sc_st", label: "SC / ST" }, { value: "minority_differently_abled", label: "Minority / Differently-abled" }, { value: "none", label: "None" },
  ]},
  { key: "stage", title: "Stage of Business", subtitle: "Current stage of the business", options: [
    { value: "idea_prototype", label: "Idea / Prototype" }, { value: "early_revenue", label: "Early revenue" }, { value: "scaling", label: "Scaling / Expansion" }, { value: "mature", label: "Mature / Stable" },
  ]},
  { key: "support_types", title: "Type of Support Needed (Pick Top 2)", subtitle: "What support are you actively seeking?", multi: true, maxSelections: 2, options: [
    { value: "grant_subsidy", label: "Grant / Subsidy" }, { value: "collateral_free_loan", label: "Collateral-free loan" }, { value: "bank_loan", label: "Bank loan" }, { value: "equity_seed", label: "Equity / Seed funding" }, { value: "interest_subsidy", label: "Interest subsidy" }, { value: "export_market", label: "Export / Market access" }, { value: "patent_ip", label: "Patent / IP support" },
  ]},
  { key: "funding_amount", title: "Funding Size Required", subtitle: "Approximate funding requirement", options: [
    { value: "under_10l", label: "< ₹10 L" }, { value: "10_50l", label: "₹10–50 L" }, { value: "50l_2cr", label: "₹50 L – 2 Cr" }, { value: "2_10cr", label: "₹2 – 10 Cr" }, { value: "over_10cr", label: "> ₹10 Cr" },
  ]},
  { key: "compliance_readiness", title: "Credit & Compliance Readiness", subtitle: "Which best describes your current status?", options: [
    { value: "ready", label: "GST + ITR + financials ready" }, { value: "partial", label: "Partial compliance" }, { value: "early", label: "Early stage / not ready" },
  ]},
  { key: "innovation_ip_export", title: "Innovation / IP / Export Angle", subtitle: "Does the business involve any of the following?", options: [
    { value: "innovative", label: "Innovative product / process" }, { value: "patent", label: "Patent filed / planned" }, { value: "export", label: "Export-oriented" }, { value: "none", label: "None" },
  ]},
];

/** Step 2: Extended questions (optional, after results). */
export const STEP2_QUESTIONS: QuestionnaireStep[] = [
  { key: "registered_in_india", title: "Is the entity registered in India?", options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]},
  { key: "operational_status", title: "Current Operational Status", options: [
    { value: "idea", label: "Idea stage" }, { value: "pre_revenue", label: "Pre-revenue" }, { value: "revenue_generating", label: "Revenue-generating" }, { value: "scaling", label: "Scaling" }, { value: "mature", label: "Mature" },
  ]},
  { key: "dpiit_detail", title: "DPIIT Startup Recognition", options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }, { value: "applied", label: "Applied" }, { value: "not_eligible", label: "Not Eligible" }]},
  { key: "udyam_detail", title: "Udyam (MSME) Registration", options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }, { value: "in_process", label: "In process" }]},
  { key: "investment_pm", title: "Investment in Plant & Machinery / Equipment", options: [
    { value: "under_1cr", label: "< ₹1 Cr" }, { value: "1_10cr", label: "₹1–10 Cr" }, { value: "10_50cr", label: "₹10–50 Cr" }, { value: "over_50cr", label: "> ₹50 Cr" },
  ]},
  { key: "msme_classification", title: "MSME Classification (if applicable)", options: [
    { value: "micro", label: "Micro" }, { value: "small", label: "Small" }, { value: "medium", label: "Medium" }, { value: "not_classified", label: "Not classified" },
  ]},
  { key: "export_orientation", title: "Is the business export-oriented?", options: [
    { value: "no", label: "No" }, { value: "planning", label: "Planning exports" }, { value: "under_25", label: "Exporting (<25% revenue)" }, { value: "over_25", label: "Exporting (>25% revenue)" },
  ]},
  { key: "special_region", title: "Special Region", options: [
    { value: "north_east", label: "North-East" }, { value: "hilly", label: "Hilly" }, { value: "border", label: "Border area" }, { value: "none", label: "None" },
  ]},
  { key: "first_gen_entrepreneur", title: "First-generation entrepreneur?", options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]},
  { key: "timeline_requirement", title: "Timeline of requirement", options: [
    { value: "immediate", label: "Immediate (0–3 months)" }, { value: "short", label: "Short-term (3–6 months)" }, { value: "medium", label: "Medium-term (6–12 months)" },
  ]},
  { key: "existing_bank_loan", title: "Existing Bank Loan?", options: [
    { value: "no", label: "No" }, { value: "secured", label: "Yes (secured)" }, { value: "unsecured", label: "Yes (unsecured)" },
  ]},
  { key: "cibil_score", title: "CIBIL Score (approx.)", options: [
    { value: "under_650", label: "<650" }, { value: "650_700", label: "650–700" }, { value: "700_750", label: "700–750" }, { value: "over_750", label: ">750" },
  ]},
  { key: "collateral", title: "Collateral Availability", options: [
    { value: "none", label: "None" }, { value: "partial", label: "Partial" }, { value: "full", label: "Full" },
  ]},
  { key: "gst_registered", title: "GST Registered?", options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]},
  { key: "itr_available", title: "Last 2 years ITR & Financials available?", options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]},
  { key: "patent_status", title: "Any patents filed / planned?", options: [
    { value: "filed", label: "Filed" }, { value: "planning", label: "Planning" }, { value: "no", label: "No" },
  ]},
  { key: "incubated", title: "Incubated under a recognised incubator?", options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]},
];
