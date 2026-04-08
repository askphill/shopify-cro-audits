export interface LighthouseScores {
  performance: number;
  accessibility: number;
  seo: number;
  best_practices: number;
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

export interface CroAudit {
  id: string;
  client_name: string;
  website_url: string;
  audit_date: string;
  lighthouse_scores: LighthouseScores;
  tech_stack: TechStack;
  findings: Finding[];
  executive_summary: string;
  cta_link?: string;
  created_at: string;
}
