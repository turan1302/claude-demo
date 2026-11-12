import type {
  ActionItemStatus,
  AnalysisStatus,
  EstimatedImpact,
  FindingCategory,
  Priority,
  SiteStatus,
} from "@/types/api";

export const categoryLabels: Record<FindingCategory, string> = {
  seo: "SEO",
  geo: "GEO",
  technical: "Teknik",
  content: "İçerik",
};

export const categoryColors: Record<FindingCategory, { bg: string; text: string }> = {
  seo: { bg: "bg-accent/12", text: "text-accent" },
  geo: { bg: "bg-good/12", text: "text-good" },
  technical: { bg: "bg-tech/12", text: "text-tech" },
  content: { bg: "bg-warn/12", text: "text-warn" },
};

export const priorityLabels: Record<Priority, string> = {
  critical: "Kritik",
  important: "Önemli",
  improvement: "İyileştirme",
};

export const priorityTextColors: Record<Priority, string> = {
  critical: "text-bad",
  important: "text-warn",
  improvement: "text-ink-tertiary",
};

export const priorityDotColors: Record<Priority, string> = {
  critical: "bg-bad",
  important: "bg-warn",
  improvement: "bg-ink-tertiary",
};

export const impactLabels: Record<EstimatedImpact, string> = {
  high: "Yüksek Etki",
  medium: "Orta Etki",
  low: "Düşük Etki",
};

export const actionStatusLabels: Record<ActionItemStatus, string> = {
  pending: "Bekliyor",
  in_progress: "Yapılıyor",
  completed: "Tamamlandı",
  dismissed: "Reddedildi",
};

export const siteStatusLabels: Record<SiteStatus, string> = {
  pending: "Bekliyor",
  analyzing: "Analiz Ediliyor",
  analyzed: "Analiz Edildi",
  error: "Hata",
};

export const analysisStatusLabels: Record<AnalysisStatus, string> = {
  queued: "Kuyrukta",
  processing: "İşleniyor",
  completed: "Tamamlandı",
  failed: "Başarısız",
};

export const analysisStepLabels: Record<string, string> = {
  fetching: "Sayfa içeriği alınıyor",
  seo_analyzers: "SEO analizi yapılıyor",
  pagespeed: "PageSpeed verisi alınıyor",
  geo_heuristic: "GEO analizi yapılıyor",
  geo_llm: "Derin GEO analizi yapılıyor",
  scoring: "Skorlar hesaplanıyor",
  action_plan: "Aksiyon planı oluşturuluyor",
};

export const reportFrequencyLabels: Record<import("@/types/api").ReportFrequency, string> = {
  weekly: "Haftalık",
  monthly: "Aylık",
};

export const reportFormatLabels: Record<import("@/types/api").ReportFormat, string> = {
  email_summary: "Özet E-posta",
  email_with_pdf: "PDF Ekli E-posta",
};

export function scoreTone(score: number | null): "good" | "warn" | "bad" {
  if (score === null) return "warn";
  if (score >= 80) return "good";
  if (score >= 50) return "warn";
  return "bad";
}
