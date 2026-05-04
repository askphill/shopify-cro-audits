export interface LighthouseScores {
  performance: number;
  accessibility: number;
  seo: number;
  best_practices: number;
}

export interface CoreWebVitalMetrics {
  lcp_ms?: number;
  inp_ms?: number;
  cls?: number;
  fcp_ms?: number;
  ttfb_ms?: number;
  tbt_ms?: number;
}

export interface CoreWebVitals {
  homepage: CoreWebVitalMetrics;
  pdp: CoreWebVitalMetrics;
}

export interface TechStack {
  theme: string;
  apps: string[];
  checkout_type: string;
  payment_providers: string[];
  analytics: string[];
}

export type FindingTheme =
  | "Checkout & Cart"
  | "Product Discovery"
  | "Product Page (PDP)"
  | "ICC & Personalization"
  | "Email & Retention"
  | "Conversion Optimization"
  | "Content & UX"
  | "Data & Analytics"
  | "Technical Infrastructure"
  | "AI & Automation"
  | "Customer Service";

export interface Finding {
  title: string;
  theme: FindingTheme;
  issue_description: string;
  business_impact: number;
  user_impact: number;
  effort_to_fix: number;
  plus_feature: string;
  plus_feature_link: string;
  screenshot_url?: string;
  evidence: string[];
}

export type BugSeverity = "critical" | "high" | "low";

export type BugCategory =
  | "JavaScript Error"
  | "Broken Link"
  | "Broken Image"
  | "Layout / Responsive"
  | "Failing Interaction"
  | "SEO Tag"
  | "Structured Data"
  | "Accessibility"
  | "Security / Mixed Content"
  | "Redirect";

export interface Bug {
  title: string;
  category: BugCategory;
  severity: BugSeverity;
  location: string;
  evidence: string;
  quick_fix: string;
  screenshot_url?: string;
}

export interface CroAudit {
  id: string;
  client_name: string;
  website_url: string;
  audit_date: string;
  lighthouse_scores: LighthouseScores;
  core_web_vitals?: CoreWebVitals;
  tech_stack: TechStack;
  findings: Finding[];
  bugs: Bug[];
  executive_summary: string;
  logo_url?: string;
  cta_link?: string;
  created_at: string;
}
