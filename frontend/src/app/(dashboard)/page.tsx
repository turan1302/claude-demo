"use client";

import { Globe, Plus } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreChip, SiteStatusPill } from "@/components/ui/badges";
import { StaggerItem, StaggerList } from "@/components/ui/stagger-list";
import { useActionItems } from "@/hooks/use-action-items";
import { useCountUp } from "@/hooks/use-count-up";
import { useDashboardSummary } from "@/hooks/use-dashboard";
import { useSites } from "@/hooks/use-sites";
import { priorityDotColors } from "@/lib/labels";
import { cn } from "@/lib/utils";

function StatCard({ label, value, sub, tone }: { label: string; value: number | null; sub: string; tone?: "good" | "warn" | "bad" }) {
  const toneColor = tone === "good" ? "text-good" : tone === "warn" ? "text-warn" : tone === "bad" ? "text-bad" : "text-ink";
  const animated = useCountUp(value ?? 0);

  return (
    <Card className="flex flex-col gap-2 p-4">
      <div className="text-[12.5px] font-medium text-ink-secondary">{label}</div>
      <div className={cn("text-[28px] font-bold tracking-tight tabular-nums", toneColor)}>{value === null ? "—" : animated}</div>
      <div className="text-[11.5px] text-ink-tertiary">{sub}</div>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: summary } = useDashboardSummary();
  const { data: sites } = useSites();
  const { data: criticalItems } = useActionItems({ priority: "critical", status: "pending" });

  const analyzingCount = summary?.sites_by_status.analyzing ?? 0;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        actions={
          <Button asChild>
            <Link href="/sites/new">
              <Plus className="h-4 w-4" strokeWidth={2.3} />
              Site Ekle
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col gap-6 px-8 py-6">
        <div className="grid grid-cols-4 gap-3">
          <StatCard label="Toplam Site" value={summary?.total_sites ?? null} sub={analyzingCount > 0 ? `${analyzingCount} tanesi analiz ediliyor` : "Tüm siteler güncel"} />
          <StatCard
            label="Ortalama SEO Skoru"
            value={summary?.average_seo_score ?? null}
            sub="Analiz edilen sitelerden ortalama"
            tone={summary?.average_seo_score != null ? (summary.average_seo_score >= 80 ? "good" : summary.average_seo_score >= 50 ? "warn" : "bad") : undefined}
          />
          <StatCard
            label="Ortalama GEO Skoru"
            value={summary?.average_geo_score ?? null}
            sub="Analiz edilen sitelerden ortalama"
            tone={summary?.average_geo_score != null ? (summary.average_geo_score >= 80 ? "good" : summary.average_geo_score >= 50 ? "warn" : "bad") : undefined}
          />
          <StatCard label="Bekleyen Kritik Aksiyon" value={summary?.critical_pending_action_items ?? null} sub="Tüm sitelerde toplam" tone="bad" />
        </div>

        <div className="grid grid-cols-[1.5fr_1fr] items-start gap-4">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Son Siteler</CardTitle>
              <Link href="/sites" className="text-[12.5px] font-semibold text-accent">
                Tümünü gör
              </Link>
            </CardHeader>

            {sites && sites.length > 0 ? (
              <StaggerList>
                {sites.slice(0, 6).map((site) => (
                  <StaggerItem key={site.id}>
                    <Link
                      href={`/sites/${site.id}`}
                      className="flex items-center gap-4 border-t border-border px-5 py-3 transition-colors duration-[120ms] first:border-t-0 hover:bg-surface-hover"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent/12">
                        <Globe className="h-[15px] w-[15px] text-accent" strokeWidth={2} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13px] font-semibold">{site.name ?? site.url}</div>
                        <div className="truncate text-[12px] text-ink-tertiary">{site.url}</div>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        {site.latest_analysis?.status === "completed" ? (
                          <>
                            <ScoreChip label="SEO" score={site.latest_analysis.overall_seo_score} />
                            <ScoreChip label="GEO" score={site.latest_analysis.overall_geo_score} />
                          </>
                        ) : null}
                      </div>
                      <SiteStatusPill status={site.status} />
                    </Link>
                  </StaggerItem>
                ))}
              </StaggerList>
            ) : (
              <div className="px-5 py-8 text-center text-sm text-ink-tertiary">
                Henüz site eklenmedi.{" "}
                <Link href="/sites/new" className="font-semibold text-accent">
                  İlk sitenizi ekleyin
                </Link>
                .
              </div>
            )}
          </Card>

          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Kritik Aksiyonlar</CardTitle>
              <Link href="/action-items?priority=critical" className="text-[12.5px] font-semibold text-accent">
                Tümünü gör
              </Link>
            </CardHeader>

            {criticalItems && criticalItems.length > 0 ? (
              <StaggerList>
                {criticalItems.slice(0, 6).map((item) => (
                  <StaggerItem key={item.id}>
                    <div className="flex items-start gap-2.5 border-t border-border px-5 py-3 first:border-t-0">
                      <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", priorityDotColors[item.priority])} />
                      <div className="min-w-0">
                        <div className="text-[13px] font-semibold leading-snug">{item.title}</div>
                        <div className="text-[11.5px] text-ink-tertiary">{item.site?.name ?? item.site?.url}</div>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerList>
            ) : (
              <div className="px-5 py-8 text-center text-sm text-ink-tertiary">Bekleyen kritik aksiyon yok.</div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
