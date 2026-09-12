"use client";

import Link from "next/link";
import { use } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { ScoreChip } from "@/components/ui/badges";
import { useSiteAnalyses } from "@/hooks/use-sites";
import { analysisStatusLabels } from "@/lib/labels";

export default function SiteAnalysesPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = use(params);
  const id = Number(siteId);
  const { data: analyses, isLoading } = useSiteAnalyses(id);

  return (
    <div>
      <PageHeader breadcrumb={<Link href={`/sites/${id}`}>Site</Link>} title="Versiyon Geçmişi" />

      <div className="px-8 py-6">
        <Card className="overflow-hidden">
          {isLoading ? (
            <div className="px-5 py-10 text-center text-sm text-ink-tertiary">Yükleniyor…</div>
          ) : analyses && analyses.length > 0 ? (
            analyses.map((analysis, index) => {
              const previous = analyses[index + 1];
              return (
                <div key={analysis.id} className="flex items-center gap-4 border-t border-border px-5 py-3.5 first:border-t-0">
                  <Link href={`/sites/${id}/analyses/${analysis.id}`} className="min-w-0 flex-1">
                    <div className="text-sm font-semibold">Sürüm {analysis.version}</div>
                    <div className="text-[12.5px] text-ink-tertiary">
                      {analysisStatusLabels[analysis.status]}
                      {analysis.completed_at ? ` · ${new Date(analysis.completed_at).toLocaleString("tr-TR")}` : ""}
                    </div>
                  </Link>
                  {analysis.status === "completed" ? (
                    <div className="flex shrink-0 gap-2">
                      <ScoreChip label="SEO" score={analysis.overall_seo_score} />
                      <ScoreChip label="GEO" score={analysis.overall_geo_score} />
                    </div>
                  ) : null}
                  {previous && analysis.status === "completed" && previous.status === "completed" ? (
                    <Link
                      href={`/sites/${id}/analyses/${analysis.id}/compare/${previous.id}`}
                      className="shrink-0 text-[13px] font-semibold text-accent"
                    >
                      Önceki ile karşılaştır
                    </Link>
                  ) : null}
                </div>
              );
            })
          ) : (
            <div className="px-5 py-10 text-center text-sm text-ink-tertiary">Henüz analiz yapılmadı.</div>
          )}
        </Card>
      </div>
    </div>
  );
}
