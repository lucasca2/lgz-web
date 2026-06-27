"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/Button";
import { TextField } from "@/shared/ui/TextField";
import { AuthCard } from "@/domains/Auth/shared/ui/AuthCard";
import { useLogin } from "@/domains/Auth/features/login/hooks";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const login = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Bloqueia disparo duplo: enquanto envia E durante o redirect pós-sucesso.
    if (login.isPending || login.isSuccess) return;

    const next: { email?: string; password?: string } = {};
    if (!EMAIL_RE.test(email.trim())) next.email = t("errors.emailInvalid");
    if (!password) next.password = t("errors.required");
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    login.mutate(
      { email: email.trim().toLowerCase(), password },
      {
        onSuccess: () => {
          router.push("/jobs");
          router.refresh();
        },
      },
    );
  }

  const status = (login.error as { status?: number } | null)?.status;
  const serverError = login.isError
    ? status === 401
      ? t("login.invalid")
      : t("errors.generic")
    : undefined;

  return (
    <AuthCard
      title={t("login.title")}
      subtitle={t("login.subtitle")}
      error={serverError}
      onSubmit={handleSubmit}
      footer={
        <>
          {t("login.noAccount")} <Link href="/signup">{t("login.goSignup")}</Link>
        </>
      }
    >
      <TextField
        label={t("fields.email")}
        hideLabel
        name="email"
        type="email"
        autoComplete="email"
        placeholder={t("fields.email")}
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={errors.email}
      />
      <TextField
        label={t("fields.password")}
        hideLabel
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder={t("fields.password")}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={errors.password}
      />
      <Button type="submit" fullWidth loading={login.isPending || login.isSuccess}>
        {t("login.submit")}
      </Button>
    </AuthCard>
  );
}
