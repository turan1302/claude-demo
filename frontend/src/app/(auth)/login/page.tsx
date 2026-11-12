"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldError, FieldLabel, Input } from "@/components/ui/input";
import { useLogin } from "@/hooks/use-auth";

const schema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi girin."),
  password: z.string().min(1, "Şifre gerekli."),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (values: FormValues) => login.mutate(values);

  return (
    <Card className="p-5 sm:p-7">
      <h1 className="text-lg font-semibold">Giriş yap</h1>
      <p className="mt-1 text-[13px] text-ink-tertiary">Sitelerinizi yönetmek için hesabınıza giriş yapın.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor="email">E-posta</FieldLabel>
          <Input id="email" type="email" autoComplete="email" placeholder="demo@example.com" {...register("email")} />
          <FieldError>{errors.email?.message}</FieldError>
        </div>

        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor="password">Şifre</FieldLabel>
          <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
          <FieldError>{errors.password?.message}</FieldError>
        </div>

        {login.isError ? (
          <p className="text-[12.5px] font-medium text-bad">{(login.error as Error).message}</p>
        ) : null}

        <Button type="submit" disabled={login.isPending} className="mt-1">
          {login.isPending ? "Giriş yapılıyor…" : "Giriş yap"}
        </Button>
      </form>

      <p className="mt-5 text-center text-[13px] text-ink-tertiary">
        Hesabınız yok mu?{" "}
        <Link href="/register" className="font-semibold">
          Kayıt olun
        </Link>
      </p>
    </Card>
  );
}
