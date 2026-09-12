"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, Plus, RefreshCw, Trash2 } from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { PageBody } from "@/components/layout/page-body";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldError, Input } from "@/components/ui/input";
import { LineChart } from "@/components/ui/line-chart";
import { StaggerItem, StaggerList } from "@/components/ui/stagger-list";
import {
  useCheckKeyword,
  useCreateKeyword,
  useDeleteKeyword,
  useKeywordRankings,
  useKeywords,
} from "@/hooks/use-keywords";
import { useSite } from "@/hooks/use-sites";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { Keyword } from "@/types/api";

const schema = z.object({ keyword: z.string().min(1, "Anahtar kelime gerekli.") });
type FormValues = z.infer<typeof schema>;

function KeywordTrend({ keywordId }: { keywordId: number }) {
  const { data: rankings, isLoading } = useKeywordRankings(keywordId);

  if (isLoading) {
    return <div className="skeleton h-32 rounded-md" />;
  }

  if (!rankings || rankings.length === 0) {
    return <div className="py-4 text-center text-[12.5px] text-ink-tertiary">Henüz sıralama verisi yok.</div>;
  }

  const points = rankings.map((r) => ({
    label: new Date(r.checked_at).toLocaleDateString("tr-TR"),
    // Sıralamada düşük = iyi; grafik "yukarı = iyi" varsaydığından negatifini gönderiyoruz.
    value: r.position === null ? -100 : -r.position,
  }));

  return (
    <div className="px-1 py-3">
      <LineChart data={points} height={140} formatValue={(v) => (v <= -100 ? "Bulunamadı" : `#${Math.abs(v)}`)} />
    </div>
  );
}

function KeywordRow({ keyword, siteId }: { keyword: Keyword; siteId: number }) {
  const [expanded, setExpanded] = useState(false);
  const deleteKeyword = useDeleteKeyword(siteId);
  const checkKeyword = useCheckKeyword(siteId);
  const position = keyword.latest_ranking?.position ?? null;

  return (
    <div className="border-t border-border first:border-t-0">
      <div className="flex items-center gap-2 px-4 py-3 sm:gap-3 sm:px-5">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 text-ink-tertiary transition-transform duration-[120ms]", expanded && "rotate-180")} strokeWidth={2.3} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold">{keyword.keyword}</div>
            {keyword.location ? <div className="text-[11.5px] text-ink-tertiary">{keyword.location}</div> : null}
          </div>
        </button>

        <div className="w-14 shrink-0 text-right text-[13px] font-semibold tabular-nums sm:w-20">
          {position === null ? <span className="text-ink-tertiary">—</span> : `#${position}`}
        </div>

        <button
          type="button"
          onClick={() => checkKeyword.mutate(keyword.id, { onSuccess: () => toast.success("Sıralama kontrolü kuyruğa alındı.") })}
          disabled={checkKeyword.isPending}
          className="shrink-0 rounded-md p-1.5 text-ink-tertiary transition-colors hover:bg-surface-hover hover:text-ink"
          aria-label="Şimdi kontrol et"
        >
          <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
        </button>

        <button
          type="button"
          onClick={() => {
            if (confirm(`"${keyword.keyword}" takipten çıkarılsın mı?`)) {
              deleteKeyword.mutate(keyword.id, { onSuccess: () => toast.success("Anahtar kelime silindi.") });
            }
          }}
          className="shrink-0 rounded-md p-1.5 text-ink-tertiary transition-colors hover:bg-bad/12 hover:text-bad"
          aria-label="Sil"
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </div>

      {expanded ? <KeywordTrend keywordId={keyword.id} /> : null}
    </div>
  );
}

export default function SiteKeywordsPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = use(params);
  const id = Number(siteId);

  const { data: site } = useSite(id);
  const { data: keywords, isLoading } = useKeywords(id);
  const createKeyword = useCreateKeyword(id);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (values: FormValues) => {
    createKeyword.mutate(
      { keyword: values.keyword },
      {
        onSuccess: () => {
          toast.success("Anahtar kelime eklendi, sıralama kontrolü başladı.");
          reset();
        },
        onError: (error) => {
          if (error instanceof ApiError && error.errors?.keyword) {
            setError("keyword", { message: error.errors.keyword[0] });
          }
        },
      }
    );
  };

  return (
    <div>
      <PageHeader breadcrumb={<Link href={`/sites/${id}`}>{site?.name ?? "Site"}</Link>} title="Anahtar Kelimeler" />

      <PageBody className="flex flex-col gap-4">
        <Card className="p-4">
          <form onSubmit={handleSubmit(onSubmit)} className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <Input placeholder="Örn. python öğren" {...register("keyword")} />
              <FieldError>{errors.keyword?.message}</FieldError>
            </div>
            <Button type="submit" size="sm" disabled={createKeyword.isPending} className="h-9 shrink-0">
              <Plus className="h-3.5 w-3.5" strokeWidth={2.3} />
              {createKeyword.isPending ? "Ekleniyor…" : "Kelime Ekle"}
            </Button>
          </form>
        </Card>

        <Card className="overflow-hidden">
          {isLoading ? (
            <div className="px-5 py-8 text-center text-sm text-ink-tertiary">Yükleniyor…</div>
          ) : keywords && keywords.length > 0 ? (
            <StaggerList>
              {keywords.map((keyword) => (
                <StaggerItem key={keyword.id}>
                  <KeywordRow keyword={keyword} siteId={id} />
                </StaggerItem>
              ))}
            </StaggerList>
          ) : (
            <div className="px-5 py-8 text-center text-sm text-ink-tertiary">
              Henüz takip edilen anahtar kelime yok.
            </div>
          )}
        </Card>
      </PageBody>
    </div>
  );
}
