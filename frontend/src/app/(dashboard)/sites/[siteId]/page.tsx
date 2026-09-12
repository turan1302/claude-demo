"use client";

import { ListChecks, RefreshCw, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreGauge } from "@/components/ui/score-gauge";
import { SiteStatusPill } from "@/components/ui/badges";
import { CompetitorPanel } from "@/components/sites/competitor-panel";
import { useAnalysisStatus } from "@/hooks/use-analysis-status";
import { useAnalyzeSite, useDeleteSite, useSite } from "@/hooks/use-sites";
import { analysisStepLabels } from "@/lib/labels";

export default function SiteDetailPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = use(params);
  const id = Number(siteId);
  const router = useRouter();

  const { data: site, isLoading } = useSite(id);
  const analyze = useAnalyzeSite();
  const deleteSite = useDeleteSite();

  const analysis = site?.latest_analysis ?? null;
  const isRunning = analysis?.status === "queued" || analysis?.status === "processing";

  useAnalysisStatus(isRunning ? analysis?.id : undefined);

  if (isLoading || !site) {
    return <div className="px-8 py-6 text-sm text-ink-tertiary">Yükleniyor…</div>;
  }

  return (
    <div>
      <PageHeader
        breadcrumb={<Link href="/sites">Siteler</Link>}
        title={site.name ?? site.url}
        description={site.url}
        actions={
          <div className="flex items-center gap-2">
            <SiteStatusPill status={site.status} />
            <Button variant="secondary" size="sm" disabled={isRunning || analyze.isPending} onClick={() => analyze.mutate(id)}>
              <RefreshCw className="h-3.5 w-3.5" strokeWidth={2.2} />
              Yeniden Analiz Et
            </Button>
            <button
              type="button"
              onClick={() => {
                if (confirm(`"${site.name ?? site.url}" silinsin mi?`)) {
                  deleteSite.mutate(id, { onSuccess: () => router.push("/sites") });
                }
              }}
              className="rounded-md p-2 text-ink-tertiary transition-colors hover:bg-bad/12 hover:text-bad"
              aria-label="Siteyi sil"
            >
              <Trash2 className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        }
      />

      <div className="flex flex-col gap-4 px-8 py-6">
        {isRunning ? (
          <Card className="flex items-center gap-3 px-5 py-3.5">
            <RefreshCw className="h-4 w-4 animate-spin text-accent" strokeWidth={2.2} />
            <div className="text-sm font-medium">
              {analysis?.current_step ? analysisStepLabels[analysis.current_step] ?? "Analiz ediliyor…" : "Analiz kuyruğa alındı…"}
            </div>
          </Card>
        ) : analysis?.status === "failed" ? (
          <Card className="border-bad/30 bg-bad/8 px-5 py-3.5 text-sm text-bad">
            Analiz başarısız oldu{analysis.error_message ? `: ${analysis.error_message}` : "."}
          </Card>
        ) : null}

        {analysis && analysis.status === "completed" ? (
          <div className="grid grid-cols-2 gap-4">
            <Card className="flex items-center gap-6 p-5">
              <ScoreGauge score={analysis.overall_seo_score} />
              <div>
                <div className="text-sm font-semibold text-ink-secondary">SEO Skoru</div>
                <p className="mt-1.5 max-w-[220px] text-[12.5px] leading-relaxed text-ink-tertiary">
                  Klasik arama motoru optimizasyonu — meta veriler, başlık yapısı, teknik SEO sinyalleri.
                </p>
              </div>
            </Card>
            <Card className="flex items-center gap-6 p-5">
              <ScoreGauge score={analysis.overall_geo_score} />
              <div>
                <div className="text-sm font-semibold text-ink-secondary">GEO Skoru</div>
                <p className="mt-1.5 max-w-[220px] text-[12.5px] leading-relaxed text-ink-tertiary">
                  İçeriğin AI arama motorları tarafından alıntılanabilirliği — yapı, netlik, E-E-A-T sinyalleri.
                </p>
              </div>
            </Card>
          </div>
        ) : null}

        {analysis && analysis.status === "completed" ? (
          <div className="grid grid-cols-2 gap-4">
            <Link href={`/sites/${id}/analyses/${analysis.id}`}>
              <Card className="flex items-center justify-between p-5 transition-colors duration-[120ms] hover:bg-surface-hover">
                <div>
                  <div className="text-sm font-semibold">Tam Analiz Sonuçları</div>
                  <div className="mt-1 text-[12.5px] text-ink-tertiary">Bulgular, Core Web Vitals, yapılandırılmış veri durumu</div>
                </div>
              </Card>
            </Link>
            <Link href={`/sites/${id}/action-plan`}>
              <Card className="flex items-center justify-between p-5 transition-colors duration-[120ms] hover:bg-surface-hover">
                <div className="flex items-center gap-3">
                  <ListChecks className="h-5 w-5 text-accent" strokeWidth={2} />
                  <div>
                    <div className="text-sm font-semibold">Aksiyon Planı</div>
                    <div className="mt-1 text-[12.5px] text-ink-tertiary">
                      {analysis.action_plan?.items.length ?? "—"} madde — durum takibi yap
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        ) : null}

        {site.type === "primary" ? (
          <Link href={`/sites/${id}/keywords`}>
            <Card className="flex items-center justify-between p-5 transition-colors duration-[120ms] hover:bg-surface-hover">
              <div className="flex items-center gap-3">
                <Search className="h-5 w-5 text-accent" strokeWidth={2} />
                <div>
                  <div className="text-sm font-semibold">Anahtar Kelime Takibi</div>
                  <div className="mt-1 text-[12.5px] text-ink-tertiary">Arama sıralaması trendini takip edin</div>
                </div>
              </div>
            </Card>
          </Link>
        ) : null}

        {site.type === "primary" ? <CompetitorPanel siteId={id} /> : null}

        <Card>
          <CardHeader>
            <CardTitle>Versiyon Geçmişi</CardTitle>
            <Link href={`/sites/${id}/analyses`} className="text-[12.5px] font-semibold text-accent">
              Tümünü gör
            </Link>
          </CardHeader>
          <div className="px-5 py-3.5 text-[13px] text-ink-tertiary">
            {analysis ? `En son: Sürüm ${analysis.version}` : "Henüz analiz yok."}
          </div>
        </Card>
      </div>
    </div>
  );
}
