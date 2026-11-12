"use client";

import { ArrowRight, Minus, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { PageBody } from "@/components/layout/page-body";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useCompareAnalyses } from "@/hooks/use-analysis";
import { cn } from "@/lib/utils";

function DeltaBadge({ delta }: { delta: number }) {
  if (delta === 0) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-surface-hover px-2.5 py-1 text-xs font-bold text-ink-secondary">
        <Minus className="h-3 w-3" strokeWidth={2.5} />
        Değişim yok
      </span>
    );
  }
  const positive = delta > 0;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold tabular-nums",
        positive ? "bg-good/12 text-good" : "bg-bad/12 text-bad"
      )}
    >
      {positive ? <TrendingUp className="h-3 w-3" strokeWidth={2.5} /> : <TrendingDown className="h-3 w-3" strokeWidth={2.5} />}
      {positive ? "+" : ""}
      {delta}
    </span>
  );
}

export default function CompareAnalysesPage({
  params,
}: {
  params: Promise<{ siteId: string; analysisId: string; compareId: string }>;
}) {
  const { siteId, analysisId, compareId } = use(params);
  const siteIdNum = Number(siteId);

  // API "from -> to" karşılaştırması yapar; sezgisel (pozitif = iyileşme) delta için
  // eski versiyonu "from", yeni versiyonu "to" olarak gönderiyoruz.
  const { data, isLoading } = useCompareAnalyses(Number(compareId), Number(analysisId));

  if (isLoading || !data) {
    return <PageBody className="text-sm text-ink-tertiary">Yükleniyor…</PageBody>;
  }

  return (
    <div>
      <PageHeader
        breadcrumb={<Link href={`/sites/${siteIdNum}/analyses`}>Versiyon Geçmişi</Link>}
        title={`Sürüm ${data.from.version} → Sürüm ${data.to.version}`}
      />

      <PageBody className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card className="flex items-center justify-between gap-3 p-4 sm:p-5">
            <div>
              <div className="text-sm font-semibold text-ink-secondary">SEO Skoru</div>
              <div className="mt-2 flex items-center gap-2 text-xl font-bold tabular-nums sm:text-2xl">
                {data.from.overall_seo_score}
                <ArrowRight className="h-4 w-4 text-ink-tertiary" strokeWidth={2} />
                {data.to.overall_seo_score}
              </div>
            </div>
            <DeltaBadge delta={data.seo_score_delta} />
          </Card>
          <Card className="flex items-center justify-between gap-3 p-4 sm:p-5">
            <div>
              <div className="text-sm font-semibold text-ink-secondary">GEO Skoru</div>
              <div className="mt-2 flex items-center gap-2 text-xl font-bold tabular-nums sm:text-2xl">
                {data.from.overall_geo_score}
                <ArrowRight className="h-4 w-4 text-ink-tertiary" strokeWidth={2} />
                {data.to.overall_geo_score}
              </div>
            </div>
            <DeltaBadge delta={data.geo_score_delta} />
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Çözülen Bulgular ({data.resolved_finding_types.length})</CardTitle>
            </CardHeader>
            {data.resolved_finding_types.length > 0 ? (
              data.resolved_finding_types.map((type) => (
                <div key={type} className="break-words border-t border-border px-4 py-3 text-[13.5px] font-medium first:border-t-0 sm:px-5">
                  {type}
                </div>
              ))
            ) : (
              <div className="px-5 py-6 text-center text-sm text-ink-tertiary">Çözülen bulgu yok.</div>
            )}
          </Card>

          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Yeni Bulgular ({data.new_finding_types.length})</CardTitle>
            </CardHeader>
            {data.new_finding_types.length > 0 ? (
              data.new_finding_types.map((type) => (
                <div key={type} className="break-words border-t border-border px-4 py-3 text-[13.5px] font-medium first:border-t-0 sm:px-5">
                  {type}
                </div>
              ))
            ) : (
              <div className="px-5 py-6 text-center text-sm text-ink-tertiary">Yeni bulgu yok.</div>
            )}
          </Card>
        </div>
      </PageBody>
    </div>
  );
}
