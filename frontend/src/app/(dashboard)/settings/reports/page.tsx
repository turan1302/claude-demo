"use client";

import { Mail, Send, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { PageBody } from "@/components/layout/page-body";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldLabel } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  useCreateReportSubscription,
  useDeleteReportSubscription,
  useReportSubscriptions,
  useSendReportNow,
  useUpdateReportSubscription,
} from "@/hooks/use-report-subscriptions";
import { useSites } from "@/hooks/use-sites";
import { reportFormatLabels, reportFrequencyLabels } from "@/lib/labels";
import type { ReportFormat, ReportFrequency } from "@/types/api";

const selectClass =
  "h-9 rounded-md border border-border bg-surface px-3 text-base focus:border-accent sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent/20";

export default function ReportsSettingsPage() {
  const { data: subscriptions } = useReportSubscriptions();
  const { data: sites } = useSites();
  const createSubscription = useCreateReportSubscription();
  const updateSubscription = useUpdateReportSubscription();
  const deleteSubscription = useDeleteReportSubscription();
  const sendNow = useSendReportNow();

  const [siteId, setSiteId] = useState<string>("all");
  const [frequency, setFrequency] = useState<ReportFrequency>("weekly");
  const [format, setFormat] = useState<ReportFormat>("email_summary");

  const onSubmit = () => {
    createSubscription.mutate(
      { site_id: siteId === "all" ? null : Number(siteId), frequency, format },
      { onSuccess: () => toast.success("Rapor aboneliği oluşturuldu.") }
    );
  };

  return (
    <div>
      <PageHeader breadcrumb={<Link href="/settings">Ayarlar</Link>} title="Raporlama" />

      <PageBody className="flex flex-col gap-4">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Abonelikler</CardTitle>
          </CardHeader>
          {subscriptions && subscriptions.length > 0 ? (
            subscriptions.map((sub) => (
              <div key={sub.id} className="flex items-center gap-3 border-t border-border px-4 py-3.5 first:border-t-0 sm:gap-4 sm:px-5">
                <div className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent/12 sm:flex">
                  <Mail className="h-[15px] w-[15px] text-accent" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-semibold">{sub.site ? (sub.site.name ?? sub.site.url) : "Tüm Siteler"}</div>
                  <div className="text-[12px] text-ink-tertiary">
                    {reportFrequencyLabels[sub.frequency]} · {reportFormatLabels[sub.format]}
                    {sub.last_sent_at ? ` · Son gönderim: ${new Date(sub.last_sent_at).toLocaleString("tr-TR")}` : " · Henüz gönderilmedi"}
                  </div>
                </div>

                <Switch
                  checked={sub.is_active}
                  onCheckedChange={(checked) => updateSubscription.mutate({ id: sub.id, is_active: checked })}
                />

                <button
                  type="button"
                  onClick={() =>
                    sendNow.mutate(sub.id, { onSuccess: () => toast.success("Rapor gönderime alındı.") })
                  }
                  disabled={sendNow.isPending}
                  className="shrink-0 rounded-md p-1.5 text-ink-tertiary transition-colors hover:bg-surface-hover hover:text-ink"
                  aria-label="Şimdi gönder"
                >
                  <Send className="h-3.5 w-3.5" strokeWidth={2} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Bu abonelik silinsin mi?")) {
                      deleteSubscription.mutate(sub.id, { onSuccess: () => toast.success("Abonelik silindi.") });
                    }
                  }}
                  className="shrink-0 rounded-md p-1.5 text-ink-tertiary transition-colors hover:bg-bad/12 hover:text-bad"
                  aria-label="Sil"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              </div>
            ))
          ) : (
            <div className="px-5 py-8 text-center text-sm text-ink-tertiary">Henüz rapor aboneliği yok.</div>
          )}
        </Card>

        <Card className="max-w-lg p-5">
          <h2 className="text-sm font-semibold">Yeni Abonelik</h2>
          <div className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <FieldLabel htmlFor="site">Site</FieldLabel>
              <select id="site" className={selectClass} value={siteId} onChange={(e) => setSiteId(e.target.value)}>
                <option value="all">Tüm Siteler (özet)</option>
                {sites?.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name ?? site.url}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <FieldLabel htmlFor="frequency">Sıklık</FieldLabel>
              <select
                id="frequency"
                className={selectClass}
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as ReportFrequency)}
              >
                <option value="weekly">Haftalık</option>
                <option value="monthly">Aylık</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <FieldLabel htmlFor="format">Format</FieldLabel>
              <select
                id="format"
                className={selectClass}
                value={format}
                onChange={(e) => setFormat(e.target.value as ReportFormat)}
              >
                <option value="email_summary">Özet E-posta</option>
                <option value="email_with_pdf">PDF Ekli E-posta</option>
              </select>
            </div>

            <Button onClick={onSubmit} disabled={createSubscription.isPending} className="self-start">
              {createSubscription.isPending ? "Oluşturuluyor…" : "Abonelik Oluştur"}
            </Button>
          </div>
        </Card>
      </PageBody>
    </div>
  );
}
