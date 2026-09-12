"use client";

import { AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { use, useMemo } from "react";
import { PageBody } from "@/components/layout/page-body";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreGauge } from "@/components/ui/score-gauge";
import { useAnalysis } from "@/hooks/use-analysis";
import { useAnalysisStatus } from "@/hooks/use-analysis-status";
import { useAnalyzeSite, useSite } from "@/hooks/use-sites";
import { categoryLabels, priorityDotColors } from "@/lib/labels";
import { cn } from "@/lib/utils";
import type { AnalysisFinding, FindingCategory } from "@/types/api";

const CATEGORY_ORDER: FindingCategory[] = ["seo", "technical", "geo", "content"];

const IMPACT_TONE: Record<string, string> = {
  critical: "bg-bad/12 text-bad",
  important: "bg-warn/12 text-warn",
  improvement: "bg-surface-hover text-ink-secondary",
};

function CwvMetric({ label, value, good }: { label: string; value: string; good: boolean }) {
  return (
    <div className="flex flex-col gap-1.5 border-l border-border p-3 first:border-l-0 sm:p-4">
      <div className="text-[11.5px] font-bold tracking-wide text-ink-tertiary">{label}</div>
      <div className="text-lg font-bold sm:text-xl">{value}</div>
      <div className={cn("flex items-center gap-1 text-[11.5px] font-semibold", good ? "text-good" : "text-warn")}>
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "currentColor" }} />
        {good ? "İyi" : "İyileştirilmeli"}
      </div>
    </div>
  );
}

export default function AnalysisResultsPage({
  params,
}: {
  params: Promise<{ siteId: string; analysisId: string }>;
}) {
  const { siteId, analysisId } = use(params);
  const siteIdNum = Number(siteId);
  const analysisIdNum = Number(analysisId);

  const { data: site } = useSite(siteIdNum);
  const { data: analysis, isLoading } = useAnalysis(analysisIdNum);
  const analyze = useAnalyzeSite();

  useAnalysisStatus(analysis?.status === "processing" || analysis?.status === "queued" ? analysisIdNum : undefined);

  const findingsByCategory = useMemo(() => {
    const groups = new Map<FindingCategory, AnalysisFinding[]>();
    for (const finding of analysis?.findings ?? []) {
      const list = groups.get(finding.category) ?? [];
      list.push(finding);
      groups.set(finding.category, list);
    }
    return groups;
  }, [analysis?.findings]);

  const hasStructuredData = !(analysis?.findings ?? []).some(
    (f) => f.type === "no_structured_data" || f.type === "invalid_structured_data"
  );

  if (isLoading || !analysis) {
    return <PageBody className="text-sm text-ink-tertiary">Yükleniyor…</PageBody>;
  }

  const mobileVitals = analysis.core_web_vitals?.mobile;

  return (
    <div>
      <PageHeader
        breadcrumb={<Link href="/sites">Siteler</Link>}
        title="Analiz Sonuçları"
        description={`${site?.url ?? ""} · Sürüm ${analysis.version}${analysis.completed_at ? ` · ${new Date(analysis.completed_at).toLocaleString("tr-TR")}` : ""}`}
        actions={
          <Button variant="secondary" size="sm" onClick={() => analyze.mutate(siteIdNum)} disabled={analyze.isPending}>
            <RefreshCw className="h-3.5 w-3.5" strokeWidth={2.2} />
            Yeniden Analiz Et
          </Button>
        }
      />

      <PageBody className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card className="flex items-center gap-4 p-4 sm:gap-6 sm:p-5">
            <ScoreGauge score={analysis.overall_seo_score} />
            <div>
              <div className="text-sm font-semibold text-ink-secondary">SEO Skoru</div>
              <p className="mt-1.5 max-w-[220px] text-[12.5px] leading-relaxed text-ink-tertiary">
                Klasik arama motoru optimizasyonu — meta veriler, başlık yapısı, teknik SEO sinyalleri.
              </p>
            </div>
          </Card>
          <Card className="flex items-center gap-4 p-4 sm:gap-6 sm:p-5">
            <ScoreGauge score={analysis.overall_geo_score} />
            <div>
              <div className="text-sm font-semibold text-ink-secondary">GEO Skoru</div>
              <p className="mt-1.5 max-w-[220px] text-[12.5px] leading-relaxed text-ink-tertiary">
                İçeriğin AI arama motorları tarafından alıntılanabilirliği — yapı, netlik, E-E-A-T sinyalleri.
              </p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[1.4fr_1fr]">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Bulgular ({analysis.findings?.length ?? 0})</CardTitle>
            </CardHeader>

            {CATEGORY_ORDER.filter((c) => findingsByCategory.has(c)).map((category) => {
              const findings = findingsByCategory.get(category) ?? [];
              return (
                <div key={category} className="border-t border-border first:border-t-0">
                  <div className="flex items-center gap-2.5 px-4 pb-2.5 pt-3.5 sm:px-5">
                    <span className="text-[12.5px] font-bold uppercase tracking-wide text-ink-tertiary">
                      {categoryLabels[category]}
                    </span>
                    <span className="rounded-full bg-surface-hover px-2 py-0.5 text-xs font-semibold text-ink-tertiary">
                      {findings.length}
                    </span>
                  </div>
                  {findings.map((finding) => (
                    <div key={finding.id} className="flex items-start gap-3 px-4 py-3 sm:gap-3.5 sm:px-5">
                      <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", priorityDotColors[finding.severity])} />
                      <div className="min-w-0 flex-1">
                        <div className="break-words text-[13.5px] font-semibold">{finding.title}</div>
                        <div className="mt-0.5 break-words text-[12.5px] leading-relaxed text-ink-tertiary">{finding.description}</div>
                      </div>
                      <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold", IMPACT_TONE[finding.severity])}>
                        -{finding.score_impact}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}

            {(analysis.findings?.length ?? 0) === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-ink-tertiary">Hiç bulgu tespit edilmedi.</div>
            ) : null}
          </Card>

          <div className="flex flex-col gap-4">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Core Web Vitals</CardTitle>
              </CardHeader>
              {mobileVitals ? (
                <div className="grid grid-cols-3">
                  <CwvMetric label="LCP" value={`${mobileVitals.lcp}s`} good={mobileVitals.lcp <= 2.5} />
                  <CwvMetric label="CLS" value={`${mobileVitals.cls}`} good={mobileVitals.cls <= 0.1} />
                  <CwvMetric label="TBT" value={`${mobileVitals.tbt}ms`} good={mobileVitals.tbt <= 200} />
                </div>
              ) : (
                <div className="px-5 py-5 text-[12.5px] leading-relaxed text-ink-tertiary">
                  PageSpeed Insights entegrasyonu eklenmediği için bu veri hesaplanmadı.{" "}
                  <Link href="/settings/integrations" className="font-semibold text-accent">
                    Ayarlar&apos;dan ekleyin
                  </Link>
                  .
                </div>
              )}
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Yapılandırılmış Veri</CardTitle>
              </CardHeader>
              <div className="flex items-start gap-3.5 px-4 py-4 sm:px-5">
                <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-md", hasStructuredData ? "bg-good/12" : "bg-bad/12")}>
                  {hasStructuredData ? (
                    <CheckCircle2 className="h-[18px] w-[18px] text-good" strokeWidth={2.2} />
                  ) : (
                    <AlertTriangle className="h-[18px] w-[18px] text-bad" strokeWidth={2.2} />
                  )}
                </div>
                <div>
                  <div className="text-[13.5px] font-semibold">
                    {hasStructuredData ? "Schema.org işaretlemesi tespit edildi" : "Schema.org işaretlemesi tespit edilmedi"}
                  </div>
                  <div className="mt-1 text-[12.5px] leading-relaxed text-ink-tertiary">
                    {hasStructuredData
                      ? "Sayfada geçerli JSON-LD blokları bulundu."
                      : "Sayfada hiçbir JSON-LD bloğu bulunamadı. Article ya da FAQPage şeması eklemek hem klasik arama hem GEO görünürlüğünü artırır."}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </PageBody>
    </div>
  );
}
