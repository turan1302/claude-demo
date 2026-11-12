"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldError, Input } from "@/components/ui/input";
import { ScoreChip } from "@/components/ui/badges";
import { StaggerItem, StaggerList } from "@/components/ui/stagger-list";
import { useCompetitorComparison, useCreateCompetitor, useDeleteCompetitor } from "@/hooks/use-competitors";
import { ApiError } from "@/lib/api-client";

const MAX_COMPETITORS = 3;

const schema = z.object({
  url: z.string().url("Geçerli bir URL girin, örn. https://rakip.com"),
  name: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function CompetitorPanel({ siteId }: { siteId: number }) {
  const [showForm, setShowForm] = useState(false);
  const { data: comparison, isLoading } = useCompetitorComparison(siteId);
  const createCompetitor = useCreateCompetitor(siteId);
  const deleteCompetitor = useDeleteCompetitor(siteId);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const competitorCount = comparison?.competitors.length ?? 0;
  const atLimit = competitorCount >= MAX_COMPETITORS;

  const onSubmit = (values: FormValues) => {
    createCompetitor.mutate(
      { url: values.url, name: values.name || undefined },
      {
        onSuccess: () => {
          toast.success("Rakip eklendi, analiz başladı.");
          reset();
          setShowForm(false);
        },
        onError: (error) => {
          if (error instanceof ApiError && error.errors?.url) {
            setError("url", { message: error.errors.url[0] });
          } else if (error instanceof ApiError) {
            toast.error(error.message);
          }
        },
      }
    );
  };

  if (isLoading || !comparison) {
    return (
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Rakip Analizi</CardTitle>
        </CardHeader>
        <div className="skeleton h-16" />
      </Card>
    );
  }

  const rows = [comparison.primary, ...comparison.competitors];

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Rakip Analizi</CardTitle>
        {!atLimit ? (
          <Button variant="secondary" size="sm" onClick={() => setShowForm((v) => !v)}>
            <Plus className="h-3.5 w-3.5" strokeWidth={2.3} />
            Rakip Ekle
          </Button>
        ) : (
          <span className="text-right text-[11.5px] text-ink-tertiary">En fazla {MAX_COMPETITORS} rakip eklenebilir</span>
        )}
      </CardHeader>

      {showForm ? (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-2 border-b border-border px-4 py-3.5 sm:flex-row sm:items-start sm:px-5"
        >
          <div className="min-w-0 sm:flex-1">
            <Input placeholder="https://rakip-domain.com" {...register("url")} />
            <FieldError>{errors.url?.message}</FieldError>
          </div>
          <div className="w-full sm:w-48">
            <Input placeholder="Görünen ad (opsiyonel)" {...register("name")} />
          </div>
          <Button type="submit" size="sm" disabled={createCompetitor.isPending} className="h-9">
            {createCompetitor.isPending ? "Ekleniyor…" : "Ekle"}
          </Button>
        </form>
      ) : null}

      <StaggerList>
        {rows.map(({ site, keyword_count, backlink_count }) => {
          const isPrimary = site.id === comparison.primary.site.id;
          const backlinkLabel = backlink_count === null ? "Backlink: yakında" : backlink_count;
          return (
            <StaggerItem key={site.id}>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border px-4 py-3 first:border-t-0 sm:px-5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[13px] font-semibold">{site.name ?? site.url}</span>
                    {isPrimary ? (
                      <span className="shrink-0 rounded-full bg-accent/12 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">
                        Ana Site
                      </span>
                    ) : null}
                  </div>
                  <div className="truncate text-[12px] text-ink-tertiary">{site.url}</div>
                  {/* Telefonda kelime/backlink sütunları yerine tek satır özet. */}
                  <div className="mt-0.5 text-[11.5px] text-ink-tertiary sm:hidden">
                    {keyword_count} kelime · {backlinkLabel}
                  </div>
                </div>

                {/* Telefonda skorlar sil butonunun altındaki ikinci satıra iner. */}
                <div className="order-last flex w-full items-center gap-2 sm:order-none sm:w-auto">
                  {site.latest_analysis?.status === "completed" ? (
                    <>
                      <ScoreChip label="SEO" score={site.latest_analysis.overall_seo_score} />
                      <ScoreChip label="GEO" score={site.latest_analysis.overall_geo_score} />
                    </>
                  ) : site.latest_analysis?.status === "failed" ? (
                    <span className="text-[12px] text-bad">Analiz başarısız oldu</span>
                  ) : (
                    <span className="text-[12px] text-ink-tertiary">Analiz bekliyor</span>
                  )}
                </div>

                <div className="hidden w-24 shrink-0 text-right text-[12.5px] tabular-nums text-ink-secondary sm:block">
                  {keyword_count} kelime
                </div>
                <div className="hidden w-28 shrink-0 text-right text-[12px] text-ink-tertiary sm:block">{backlinkLabel}</div>

                {!isPrimary ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`"${site.name ?? site.url}" rakip listesinden silinsin mi?`)) {
                        deleteCompetitor.mutate(site.id, { onSuccess: () => toast.success("Rakip silindi.") });
                      }
                    }}
                    className="shrink-0 rounded-md p-1.5 text-ink-tertiary transition-colors hover:bg-bad/12 hover:text-bad"
                    aria-label="Rakibi sil"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                ) : (
                  <div className="w-[26px] shrink-0" />
                )}
              </div>
            </StaggerItem>
          );
        })}
      </StaggerList>
    </Card>
  );
}
