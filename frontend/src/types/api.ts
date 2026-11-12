export type SiteStatus = "pending" | "analyzing" | "analyzed" | "error";
export type SiteType = "primary" | "competitor";
export type AnalysisStatus = "queued" | "processing" | "completed" | "failed";
export type FindingCategory = "seo" | "geo" | "technical" | "content";
export type FindingSource = "rule" | "pagespeed" | "llm";
export type Priority = "critical" | "important" | "improvement";
export type EstimatedImpact = "high" | "medium" | "low";
export type ActionItemStatus = "pending" | "in_progress" | "completed" | "dismissed";
export type IntegrationProvider = "pagespeed_insights" | "anthropic" | "openai";

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface CoreWebVitalsMetrics {
  lcp: number;
  cls: number;
  tbt: number;
  performance_score: number;
}

export interface CoreWebVitals {
  mobile?: CoreWebVitalsMetrics;
  desktop?: CoreWebVitalsMetrics;
}

export interface AnalysisFinding {
  id: number;
  category: FindingCategory;
  type: string;
  source: FindingSource;
  severity: Priority;
  title: string;
  description: string;
  evidence: Record<string, unknown> | null;
  score_impact: number;
}

export interface ActionItem {
  id: number;
  action_plan_id: number;
  analysis_finding_id: number | null;
  category: FindingCategory;
  priority: Priority;
  title: string;
  description: string;
  estimated_impact: EstimatedImpact;
  status: ActionItemStatus;
  position: number;
  completed_at: string | null;
  site?: { id: number; name: string | null; url: string };
}

export interface ActionPlan {
  id: number;
  site_analysis_id: number;
  summary: string | null;
  generated_at: string;
  items: ActionItem[];
}

export interface SiteAnalysis {
  id: number;
  site_id: number;
  version: number;
  status: AnalysisStatus;
  current_step: string | null;
  overall_seo_score: number | null;
  overall_geo_score: number | null;
  core_web_vitals: CoreWebVitals | null;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  findings?: AnalysisFinding[];
  action_plan?: ActionPlan | null;
}

export interface Site {
  id: number;
  type: SiteType;
  parent_site_id: number | null;
  url: string;
  name: string | null;
  status: SiteStatus;
  last_analyzed_at: string | null;
  created_at: string;
  latest_analysis: SiteAnalysis | null;
}

export interface Integration {
  id: number;
  provider: IntegrationProvider;
  masked_key: string;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
}

export interface DashboardSummary {
  total_sites: number;
  average_seo_score: number | null;
  average_geo_score: number | null;
  critical_pending_action_items: number;
  sites_by_status: Partial<Record<SiteStatus, number>>;
}

export interface AnalysisCompareResult {
  from: SiteAnalysis;
  to: SiteAnalysis;
  seo_score_delta: number;
  geo_score_delta: number;
  resolved_finding_types: string[];
  new_finding_types: string[];
}

export interface CompetitorSummary {
  site: Site;
  keyword_count: number;
  backlink_count: number | null;
}

export interface CompetitorComparison {
  primary: CompetitorSummary;
  competitors: CompetitorSummary[];
}

export interface KeywordRanking {
  id: number;
  position: number | null;
  ranking_url: string | null;
  checked_at: string;
}

export interface Keyword {
  id: number;
  site_id: number;
  keyword: string;
  location: string | null;
  is_active: boolean;
  latest_ranking?: KeywordRanking | null;
  created_at: string;
}

export type ReportFrequency = "weekly" | "monthly";
export type ReportFormat = "email_summary" | "email_with_pdf";

export interface NotificationData {
  type: string;
  site_id: number;
  site_name: string | null;
  analysis_id: number;
  critical_finding_count: number;
  message: string;
}

export interface AppNotification {
  id: string;
  data: NotificationData;
  read_at: string | null;
  created_at: string;
}

export interface ReportSubscription {
  id: number;
  site: { id: number; name: string | null; url: string } | null;
  frequency: ReportFrequency;
  format: ReportFormat;
  is_active: boolean;
  last_sent_at: string | null;
  created_at: string;
}
