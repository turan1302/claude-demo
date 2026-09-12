"use client";

import Link from "next/link";
import { use } from "react";
import { PageBody } from "@/components/layout/page-body";
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

      <PageBody>
        <Card className="overflow-hidden">
          {isLoading ? (
            <div className="px-5 py-10 text-center text-sm text-ink-tertiary">Yükleniyor…</div>
          ) : analyses && analyses.length > 0 ? (
            analyses.map((analysis, index) => {
              const previous = analyses[index + 1];
              const completed = analysis.status === "completed";
              const canCompare = previous && completed && previous.status === "completed";
              return (
                <div key={analysis.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border px-4 py-3.5 first:border-t-0 sm:px-5">
                  <Link href={`/sites/${id}/analyses/${analysis.id}`} className="min-w-0 flex-1">
                    <div className="text-sm font-semibold">Sürüm {analysis.version}</div>
                    <div className="text-[12.5px] text-ink-tertiary">
                      {analysisStatusLabels[analysis.status]}
                      {analysis.completed_at ? ` · ${new Date(analysis.completed_at).toLocaleString("tr-TR")}` : ""}
                    </div>
                  </Link>
                  {/* Telefonda skorlar ve karşılaştır bağlantısı ikinci satıra iner. */}
                  {completed || canCompare ? (
                    <div className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 sm:w-auto">
                      {completed ? (
                        <div className="flex gap-2">
                          <ScoreChip label="SEO" score={analysis.overall_seo_score} />
                          <ScoreChip label="GEO" score={analysis.overall_geo_score} />
                        </div>
                      ) : null}
                      {canCompare ? (
                        <Link
                          href={`/sites/${id}/analyses/${analysis.id}/compare/${previous.id}`}
                          className="text-[13px] font-semibold text-accent"
                        >
                          Önceki ile karşılaştır
                        </Link>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })
          ) : (
            <div className="px-5 py-10 text-center text-sm text-ink-tertiary">Henüz analiz yapılmadı.</div>
          )}
        </Card>
      </PageBody>
    </div>
  );
}
