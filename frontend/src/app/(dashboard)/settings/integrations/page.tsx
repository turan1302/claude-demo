"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Trash2 } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { PageBody } from "@/components/layout/page-body";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldError, FieldLabel, Input } from "@/components/ui/input";
import { useCreateIntegration, useDeleteIntegration, useIntegrations } from "@/hooks/use-integrations";
import type { IntegrationProvider } from "@/types/api";

const PROVIDER_LABELS: Record<IntegrationProvider, string> = {
  pagespeed_insights: "Google PageSpeed Insights",
  anthropic: "Anthropic (Claude)",
  openai: "OpenAI",
};

const schema = z.object({
  provider: z.enum(["pagespeed_insights", "anthropic", "openai"]),
  api_key: z.string().min(8, "API key en az 8 karakter olmalı."),
});

type FormValues = z.infer<typeof schema>;

export default function IntegrationsPage() {
  const { data: integrations } = useIntegrations();
  const createIntegration = useCreateIntegration();
  const deleteIntegration = useDeleteIntegration();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { provider: "pagespeed_insights" } });

  const onSubmit = (values: FormValues) => {
    createIntegration.mutate(values, {
      onSuccess: () => {
        toast.success("Entegrasyon kaydedildi.");
        reset({ provider: values.provider, api_key: "" });
      },
    });
  };

  return (
    <div>
      <PageHeader breadcrumb={<Link href="/settings">Ayarlar</Link>} title="Entegrasyonlar" />

      <PageBody className="flex flex-col gap-4">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Kayıtlı Anahtarlar</CardTitle>
          </CardHeader>
          {integrations && integrations.length > 0 ? (
            integrations.map((integration) => (
              <div key={integration.id} className="flex items-center gap-3.5 border-t border-border px-4 py-3.5 first:border-t-0 sm:px-5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent/12">
                  <KeyRound className="h-[15px] w-[15px] text-accent" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">{PROVIDER_LABELS[integration.provider]}</div>
                  <div className="break-all text-[12.5px] text-ink-tertiary">{integration.masked_key}</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Bu anahtar silinsin mi?")) {
                      deleteIntegration.mutate(integration.id, { onSuccess: () => toast.success("Anahtar silindi.") });
                    }
                  }}
                  className="rounded-md p-2 text-ink-tertiary transition-colors hover:bg-bad/12 hover:text-bad"
                  aria-label="Anahtarı sil"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
            ))
          ) : (
            <div className="px-5 py-8 text-center text-sm text-ink-tertiary">Henüz entegrasyon eklenmedi.</div>
          )}
        </Card>

        <Card className="max-w-lg p-5">
          <h2 className="text-sm font-semibold">Anahtar Ekle / Güncelle</h2>
          <p className="mt-1 text-[12.5px] text-ink-tertiary">
            PageSpeed Insights Core Web Vitals verisini açar; Anthropic/OpenAI derin GEO analizini açar. İkisi de opsiyoneldir.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-5 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <FieldLabel htmlFor="provider">Sağlayıcı</FieldLabel>
              <select
                id="provider"
                className="h-9 rounded-md border border-border bg-surface px-3 text-base focus:border-accent sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                {...register("provider")}
              >
                {Object.entries(PROVIDER_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <FieldLabel htmlFor="api_key">API Key</FieldLabel>
              <Input id="api_key" type="password" autoComplete="off" {...register("api_key")} />
              <FieldError>{errors.api_key?.message}</FieldError>
            </div>

            {createIntegration.isError ? (
              <p className="text-[12.5px] font-medium text-bad">{(createIntegration.error as Error).message}</p>
            ) : null}

            <Button type="submit" disabled={createIntegration.isPending} className="mt-1 self-start">
              {createIntegration.isPending ? "Kaydediliyor…" : "Kaydet"}
            </Button>
          </form>
        </Card>
      </PageBody>
    </div>
  );
}
