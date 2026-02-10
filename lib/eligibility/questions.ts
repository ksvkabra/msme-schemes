/**
 * Step 1: 12 questions used to show scheme matches (Startup vs MSME vs Ineligible).
 * Step 2: Extended questionnaire for users who want to continue.
 */

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

/** Options for a single-select or multi-select step. */
export interface QuestionOption {
  value: string;
  label: string;
}

export interface QuestionnaireStep {
  key: keyof Step1FormData | string;
  title: string;
  subtitle?: string;
  options: QuestionOption[];
  multi?: boolean; // if true, select top 2 or multiple
  maxSelections?: number;
}

/** Step 1: 12 questions — necessary for scheme matching and classification. */
export const STEP1_QUESTIONS: QuestionnaireStep[] = [
  {
    key: "legal_entity_type",
    title: "Legal Status & Age",
    subtitle: "What is the legal structure and year of incorporation?",
    options: [
      { value: "proprietorship", label: "Proprietorship" },
      { value: "partnership_llp", label: "Partnership / LLP" },
      { value: "private_limited_opc", label: "Private Limited / OPC" },
      { value: "society_trust", label: "Society / Trust" },
    ],
  },
  {
    key: "active_year",
    title: "Year of incorporation / registration",
    subtitle: "In which year did you incorporate or register?",
    options: [
      { value: "2024", label: "2024" },
      { value: "2023", label: "2023" },
      { value: "2022", label: "2022" },
      { value: "2021", label: "2021" },
      { value: "2020", label: "2020" },
      { value: "2019", label: "2019" },
      { value: "2018", label: "2018" },
      { value: "2015-2017", label: "2015–2017" },
      { value: "2010-2014", label: "2010–2014" },
      { value: "before_2010", label: "Before 2010" },
    ],
  },
  {
    key: "recognition_status",
    title: "Recognition Status",
    subtitle: "Which registrations do you currently have?",
    options: [
      { value: "dpiit", label: "DPIIT Startup Recognition" },
      { value: "udyam", label: "Udyam (MSME) Registration" },
      { value: "both", label: "Both" },
      { value: "none", label: "None" },
    ],
  },
  {
    key: "turnover",
    title: "Turnover (Last FY)",
    subtitle: "What is your annual turnover?",
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
    key: "sector",
    title: "Sector of Operation",
    subtitle: "Which sector best describes your business?",
    options: [
      { value: "agriculture_food", label: "Agriculture / Food Processing" },
      { value: "manufacturing", label: "Manufacturing" },
      { value: "services", label: "Services" },
      { value: "technology_saas", label: "Technology / SaaS / IT" },
      { value: "deeptech_rd", label: "DeepTech / R&D / IP-based" },
      { value: "trading", label: "Trading" },
    ],
  },
  {
    key: "sub_sector",
    title: "Sub-Sector (One Primary)",
    subtitle: "Your primary sub-sector",
    options: [
      { value: "electronics_ev_cleantech", label: "Electronics / EV / CleanTech" },
      { value: "pharma_healthcare", label: "Pharma / Healthcare" },
      { value: "textiles_apparel", label: "Textiles / Apparel" },
      { value: "agritech_foodtech", label: "AgriTech / FoodTech" },
      { value: "fintech_edtech", label: "FinTech / EdTech" },
      { value: "defence_aerospace", label: "Defence / Aerospace" },
      { value: "other", label: "Other" },
    ],
  },
  {
    key: "state",
    title: "Location — State",
    subtitle: "Where is the business primarily located?",
    options: [
      { value: "Andhra Pradesh", label: "Andhra Pradesh" },
      { value: "Bihar", label: "Bihar" },
      { value: "Delhi", label: "Delhi" },
      { value: "Gujarat", label: "Gujarat" },
      { value: "Karnataka", label: "Karnataka" },
      { value: "Maharashtra", label: "Maharashtra" },
      { value: "Tamil Nadu", label: "Tamil Nadu" },
      { value: "Uttar Pradesh", label: "Uttar Pradesh" },
      { value: "West Bengal", label: "West Bengal" },
      { value: "Assam", label: "Assam" },
      { value: "Haryana", label: "Haryana" },
      { value: "Kerala", label: "Kerala" },
      { value: "Madhya Pradesh", label: "Madhya Pradesh" },
      { value: "Odisha", label: "Odisha" },
      { value: "Punjab", label: "Punjab" },
      { value: "Rajasthan", label: "Rajasthan" },
      { value: "Telangana", label: "Telangana" },
      { value: "Other", label: "Other" },
    ],
  },
  {
    key: "location_advantage",
    title: "Location Advantage",
    subtitle: "Area type",
    options: [
      { value: "ne_aspirational_rural", label: "North-East / Aspirational District / Rural" },
      { value: "urban_general", label: "Urban / General" },
    ],
  },
  {
    key: "ownership_category",
    title: "Ownership Category",
    subtitle: "Does the business have majority ownership by any of the following?",
    options: [
      { value: "woman", label: "Woman Entrepreneur" },
      { value: "sc_st", label: "SC / ST" },
      { value: "minority_differently_abled", label: "Minority / Differently-abled" },
      { value: "none", label: "None" },
    ],
  },
  {
    key: "stage",
    title: "Stage of Business",
    subtitle: "Current stage of the business",
    options: [
      { value: "idea_prototype", label: "Idea / Prototype" },
      { value: "early_revenue", label: "Early revenue" },
      { value: "scaling", label: "Scaling / Expansion" },
      { value: "mature", label: "Mature / Stable" },
    ],
  },
  {
    key: "support_types",
    title: "Type of Support Needed (Pick Top 2)",
    subtitle: "What support are you actively seeking?",
    multi: true,
    maxSelections: 2,
    options: [
      { value: "grant_subsidy", label: "Grant / Subsidy" },
      { value: "collateral_free_loan", label: "Collateral-free loan" },
      { value: "bank_loan", label: "Bank loan" },
      { value: "equity_seed", label: "Equity / Seed funding" },
      { value: "interest_subsidy", label: "Interest subsidy" },
      { value: "export_market", label: "Export / Market access" },
      { value: "patent_ip", label: "Patent / IP support" },
    ],
  },
  {
    key: "funding_amount",
    title: "Funding Size Required",
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
    key: "compliance_readiness",
    title: "Credit & Compliance Readiness",
    subtitle: "Which best describes your current status?",
    options: [
      { value: "ready", label: "GST + ITR + financials ready" },
      { value: "partial", label: "Partial compliance" },
      { value: "early", label: "Early stage / not ready" },
    ],
  },
  {
    key: "innovation_ip_export",
    title: "Innovation / IP / Export Angle",
    subtitle: "Does the business involve any of the following?",
    options: [
      { value: "innovative", label: "Innovative product / process" },
      { value: "patent", label: "Patent filed / planned" },
      { value: "export", label: "Export-oriented" },
      { value: "none", label: "None" },
    ],
  },
];

/** Step 2: Extended questions (optional, after user sees scheme results). */
export const STEP2_QUESTIONS: QuestionnaireStep[] = [
  {
    key: "registered_in_india",
    title: "Is the entity registered in India?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },
  {
    key: "operational_status",
    title: "Current Operational Status",
    options: [
      { value: "idea", label: "Idea stage" },
      { value: "pre_revenue", label: "Pre-revenue" },
      { value: "revenue_generating", label: "Revenue-generating" },
      { value: "scaling", label: "Scaling" },
      { value: "mature", label: "Mature" },
    ],
  },
  {
    key: "dpiit_detail",
    title: "DPIIT Startup Recognition",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "applied", label: "Applied" },
      { value: "not_eligible", label: "Not Eligible" },
    ],
  },
  {
    key: "udyam_detail",
    title: "Udyam (MSME) Registration",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "in_process", label: "In process" },
    ],
  },
  {
    key: "investment_pm",
    title: "Investment in Plant & Machinery / Equipment",
    options: [
      { value: "under_1cr", label: "< ₹1 Cr" },
      { value: "1_10cr", label: "₹1–10 Cr" },
      { value: "10_50cr", label: "₹10–50 Cr" },
      { value: "over_50cr", label: "> ₹50 Cr" },
    ],
  },
  {
    key: "msme_classification",
    title: "MSME Classification (if applicable)",
    options: [
      { value: "micro", label: "Micro" },
      { value: "small", label: "Small" },
      { value: "medium", label: "Medium" },
      { value: "not_classified", label: "Not classified" },
    ],
  },
  {
    key: "export_orientation",
    title: "Is the business export-oriented?",
    options: [
      { value: "no", label: "No" },
      { value: "planning", label: "Planning exports" },
      { value: "under_25", label: "Exporting (<25% revenue)" },
      { value: "over_25", label: "Exporting (>25% revenue)" },
    ],
  },
  {
    key: "special_region",
    title: "Special Region",
    options: [
      { value: "north_east", label: "North-East" },
      { value: "hilly", label: "Hilly" },
      { value: "border", label: "Border area" },
      { value: "none", label: "None" },
    ],
  },
  {
    key: "first_gen_entrepreneur",
    title: "First-generation entrepreneur?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },
  {
    key: "timeline_requirement",
    title: "Timeline of requirement",
    options: [
      { value: "immediate", label: "Immediate (0–3 months)" },
      { value: "short", label: "Short-term (3–6 months)" },
      { value: "medium", label: "Medium-term (6–12 months)" },
    ],
  },
  {
    key: "existing_bank_loan",
    title: "Existing Bank Loan?",
    options: [
      { value: "no", label: "No" },
      { value: "secured", label: "Yes (secured)" },
      { value: "unsecured", label: "Yes (unsecured)" },
    ],
  },
  {
    key: "cibil_score",
    title: "CIBIL Score (approx.)",
    options: [
      { value: "under_650", label: "<650" },
      { value: "650_700", label: "650–700" },
      { value: "700_750", label: "700–750" },
      { value: "over_750", label: ">750" },
    ],
  },
  {
    key: "collateral",
    title: "Collateral Availability",
    options: [
      { value: "none", label: "None" },
      { value: "partial", label: "Partial" },
      { value: "full", label: "Full" },
    ],
  },
  {
    key: "gst_registered",
    title: "GST Registered?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },
  {
    key: "itr_available",
    title: "Last 2 years ITR & Financials available?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },
  {
    key: "patent_status",
    title: "Any patents filed / planned?",
    options: [
      { value: "filed", label: "Filed" },
      { value: "planning", label: "Planning" },
      { value: "no", label: "No" },
    ],
  },
  {
    key: "incubated",
    title: "Incubated under a recognised incubator?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },
];
