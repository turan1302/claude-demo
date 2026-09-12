"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { PageBody } from "@/components/layout/page-body";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldError, FieldLabel, Input } from "@/components/ui/input";
import { useCreateSite } from "@/hooks/use-sites";
import { ApiError } from "@/lib/api-client";

const schema = z.object({
  url: z.string().url("Geçerli bir URL girin, örn. https://example.com"),
  name: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function NewSitePage() {
  const router = useRouter();
  const createSite = useCreateSite();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (values: FormValues) => {
    createSite.mutate(
      { url: values.url, name: values.name || undefined },
      {
        onSuccess: (data) => {
          toast.success("Site eklendi, analiz başladı.");
          router.push(`/sites/${data.site.id}`);
        },
        onError: (error) => {
          if (error instanceof ApiError && error.errors?.url) {
            setError("url", { message: error.errors.url[0] });
          }
        },
      }
    );
  };

  return (
    <div>
      <PageHeader title="Site Ekle" description="Analiz edilecek sitenin adresini girin." />

      <PageBody>
        <Card className="max-w-lg p-5">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <FieldLabel htmlFor="url">Site URL&apos;i</FieldLabel>
              <Input id="url" placeholder="https://example.com" autoFocus {...register("url")} />
              <FieldError>{errors.url?.message}</FieldError>
            </div>

            <div className="flex flex-col gap-1.5">
              <FieldLabel htmlFor="name">Görünen Ad (opsiyonel)</FieldLabel>
              <Input id="name" placeholder="Örn. Şirket Web Sitesi" {...register("name")} />
              <FieldError>{errors.name?.message}</FieldError>
            </div>

            {createSite.isError && !(createSite.error instanceof ApiError && createSite.error.errors?.url) ? (
              <p className="text-[12.5px] font-medium text-bad">{(createSite.error as Error).message}</p>
            ) : null}

            <Button type="submit" disabled={createSite.isPending} className="mt-1 self-start">
              {createSite.isPending ? "Ekleniyor…" : "Siteyi Ekle ve Analiz Et"}
            </Button>
          </form>
        </Card>
      </PageBody>
    </div>
  );
}
