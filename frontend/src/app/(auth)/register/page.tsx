"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldError, FieldLabel, Input } from "@/components/ui/input";
import { useRegister } from "@/hooks/use-auth";

const schema = z
  .object({
    name: z.string().min(1, "Ad soyad gerekli."),
    email: z.string().email("Geçerli bir e-posta adresi girin."),
    password: z.string().min(8, "Şifre en az 8 karakter olmalı."),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Şifreler eşleşmiyor.",
    path: ["password_confirmation"],
  });

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const register_ = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (values: FormValues) => register_.mutate(values);

  return (
    <Card className="p-7">
      <h1 className="text-lg font-semibold">Hesap oluştur</h1>
      <p className="mt-1 text-[13px] text-ink-tertiary">Sitelerinizi analiz etmeye başlayın.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor="name">Ad Soyad</FieldLabel>
          <Input id="name" autoComplete="name" {...register("name")} />
          <FieldError>{errors.name?.message}</FieldError>
        </div>

        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor="email">E-posta</FieldLabel>
          <Input id="email" type="email" autoComplete="email" {...register("email")} />
          <FieldError>{errors.email?.message}</FieldError>
        </div>

        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor="password">Şifre</FieldLabel>
          <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
          <FieldError>{errors.password?.message}</FieldError>
        </div>

        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor="password_confirmation">Şifre (tekrar)</FieldLabel>
          <Input id="password_confirmation" type="password" autoComplete="new-password" {...register("password_confirmation")} />
          <FieldError>{errors.password_confirmation?.message}</FieldError>
        </div>

        {register_.isError ? (
          <p className="text-[12.5px] font-medium text-bad">{(register_.error as Error).message}</p>
        ) : null}

        <Button type="submit" disabled={register_.isPending} className="mt-1">
          {register_.isPending ? "Hesap oluşturuluyor…" : "Hesap oluştur"}
        </Button>
      </form>

      <p className="mt-5 text-center text-[13px] text-ink-tertiary">
        Zaten hesabınız var mı?{" "}
        <Link href="/login" className="font-semibold">
          Giriş yapın
        </Link>
      </p>
    </Card>
  );
}
