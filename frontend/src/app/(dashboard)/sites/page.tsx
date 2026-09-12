"use client";

import { Globe, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScoreChip, SiteStatusPill } from "@/components/ui/badges";
import { StaggerItem, StaggerList } from "@/components/ui/stagger-list";
import { useDeleteSite, useSites } from "@/hooks/use-sites";

export default function SitesPage() {
  const { data: sites, isLoading } = useSites();
  const deleteSite = useDeleteSite();

  return (
    <div>
      <PageHeader
        title="Siteler"
        description={sites ? `${sites.length} site` : undefined}
        actions={
          <Button asChild>
            <Link href="/sites/new">
              <Plus className="h-4 w-4" strokeWidth={2.3} />
              Site Ekle
            </Link>
          </Button>
        }
      />

      <div className="px-8 py-6">
        <Card className="overflow-hidden">
          {isLoading ? (
            <div className="px-5 py-10 text-center text-sm text-ink-tertiary">Yükleniyor…</div>
          ) : sites && sites.length > 0 ? (
            <StaggerList>
              {sites.map((site) => (
                <StaggerItem key={site.id}>
                  <div className="flex items-center gap-4 border-t border-border px-5 py-3.5 first:border-t-0">
                    <Link href={`/sites/${site.id}`} className="flex min-w-0 flex-1 items-center gap-3.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent/12">
                        <Globe className="h-[15px] w-[15px] text-accent" strokeWidth={2} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13px] font-semibold">{site.name ?? site.url}</div>
                        <div className="truncate text-[12px] text-ink-tertiary">{site.url}</div>
                      </div>
                    </Link>

                    {site.latest_analysis?.status === "completed" ? (
                      <div className="flex shrink-0 gap-2">
                        <ScoreChip label="SEO" score={site.latest_analysis.overall_seo_score} />
                        <ScoreChip label="GEO" score={site.latest_analysis.overall_geo_score} />
                      </div>
                    ) : null}

                    <SiteStatusPill status={site.status} />

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`"${site.name ?? site.url}" silinsin mi? Bu işlem geri alınamaz.`)) {
                          deleteSite.mutate(site.id, {
                            onSuccess: () => toast.success("Site silindi."),
                            onError: () => toast.error("Site silinemedi."),
                          });
                        }
                      }}
                      className="rounded-md p-2 text-ink-tertiary transition-colors hover:bg-bad/12 hover:text-bad"
                      aria-label="Siteyi sil"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={2} />
                    </button>
                  </div>
                </StaggerItem>
              ))}
            </StaggerList>
          ) : (
            <div className="px-5 py-10 text-center text-sm text-ink-tertiary">
              Henüz site eklenmedi.{" "}
              <Link href="/sites/new" className="font-semibold text-accent">
                İlk sitenizi ekleyin
              </Link>
              .
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
