"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, Mail, Plug } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { PageBody } from "@/components/layout/page-body";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldError, FieldLabel, Input } from "@/components/ui/input";
import { useCurrentUser, useUpdatePassword, useUpdateProfile } from "@/hooks/use-auth";

const LINKS = [
  {
    href: "/settings/integrations",
    icon: Plug,
    title: "Entegrasyonlar",
    description: "PageSpeed Insights ve LLM (Claude/OpenAI) API anahtarlarını yönetin",
  },
  {
    href: "/settings/reports",
    icon: Mail,
    title: "Raporlama",
    description: "Haftalık/aylık otomatik özet raporlarınızı yönetin",
  },
];

const profileSchema = z.object({
  name: z.string().min(1, "Ad soyad zorunlu."),
  email: z.string().min(1, "E-posta zorunlu.").email("Geçerli bir e-posta girin."),
});
type ProfileValues = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    current_password: z.string().min(1, "Mevcut şifrenizi girin."),
    password: z.string().min(8, "Yeni şifre en az 8 karakter olmalı."),
    password_confirmation: z.string().min(1, "Şifre tekrarını girin."),
  })
  .refine((v) => v.password === v.password_confirmation, {
    message: "Şifreler eşleşmiyor.",
    path: ["password_confirmation"],
  });
type PasswordValues = z.infer<typeof passwordSchema>;

function ProfileForm() {
  const { data: user } = useCurrentUser();
  const updateProfile = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileValues>({ resolver: zodResolver(profileSchema), defaultValues: { name: "", email: "" } });

  useEffect(() => {
    if (user) reset({ name: user.name, email: user.email });
  }, [user, reset]);

  const onSubmit = (values: ProfileValues) => {
    updateProfile.mutate(values, {
      onSuccess: (updated) => {
        toast.success("Hesap bilgileri güncellendi.");
        reset({ name: updated.name, email: updated.email });
      },
    });
  };

  return (
    <Card className="p-5">
      <h2 className="text-sm font-semibold">Hesap Bilgileri</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor="name">Ad Soyad</FieldLabel>
          <Input id="name" {...register("name")} />
          <FieldError>{errors.name?.message}</FieldError>
        </div>
        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor="email">E-posta</FieldLabel>
          <Input id="email" type="email" {...register("email")} />
          <FieldError>{errors.email?.message}</FieldError>
        </div>

        {updateProfile.isError ? (
          <p className="text-[12.5px] font-medium text-bad">{(updateProfile.error as Error).message}</p>
        ) : null}

        <Button type="submit" size="sm" disabled={!isDirty || updateProfile.isPending} className="self-start">
          {updateProfile.isPending ? "Kaydediliyor…" : "Kaydet"}
        </Button>
      </form>
    </Card>
  );
}

function PasswordForm() {
  const updatePassword = useUpdatePassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) });

  const onSubmit = (values: PasswordValues) => {
    updatePassword.mutate(values, {
      onSuccess: () => {
        toast.success("Şifre güncellendi.");
        reset({ current_password: "", password: "", password_confirmation: "" });
      },
    });
  };

  return (
    <Card className="p-5">
      <h2 className="text-sm font-semibold">Şifre Değiştir</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor="current_password">Mevcut Şifre</FieldLabel>
          <Input id="current_password" type="password" autoComplete="current-password" {...register("current_password")} />
          <FieldError>{errors.current_password?.message}</FieldError>
        </div>
        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor="password">Yeni Şifre</FieldLabel>
          <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
          <FieldError>{errors.password?.message}</FieldError>
        </div>
        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor="password_confirmation">Yeni Şifre (Tekrar)</FieldLabel>
          <Input id="password_confirmation" type="password" autoComplete="new-password" {...register("password_confirmation")} />
          <FieldError>{errors.password_confirmation?.message}</FieldError>
        </div>

        {updatePassword.isError ? (
          <p className="text-[12.5px] font-medium text-bad">{(updatePassword.error as Error).message}</p>
        ) : null}

        <Button type="submit" size="sm" disabled={updatePassword.isPending} className="self-start">
          {updatePassword.isPending ? "Güncelleniyor…" : "Şifreyi Güncelle"}
        </Button>
      </form>
    </Card>
  );
}

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="Ayarlar" />

      <PageBody className="flex flex-col gap-4">
        <div className="grid gap-4 md:grid-cols-2 xl:max-w-3xl">
          <ProfileForm />
          <PasswordForm />
        </div>

        {LINKS.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="flex items-center justify-between gap-3 p-5 transition-colors duration-[120ms] hover:bg-surface-hover">
              <div className="flex items-center gap-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent/12">
                  <link.icon className="h-[15px] w-[15px] text-accent" strokeWidth={2} />
                </div>
                <div>
                  <div className="text-sm font-semibold">{link.title}</div>
                  <div className="mt-0.5 text-[12.5px] text-ink-tertiary">{link.description}</div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-ink-tertiary" strokeWidth={2} />
            </Card>
          </Link>
        ))}
      </PageBody>
    </div>
  );
}
