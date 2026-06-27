"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/Button";
import { TextField } from "@/shared/ui/TextField";
import { AuthCard } from "@/domains/Auth/shared/ui/AuthCard";
import { useLogin } from "@/domains/Auth/features/login/hooks";
import { apiRoutes } from "@/domains/Auth/shared/constants/apiRoutes";
import styles from "./LoginForm.module.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const loginError = login.isError
    ? status === 401
      ? t("login.invalid")
      : t("errors.generic")
    : undefined;

  const oauthError = searchParams.get("error");
  const urlError =
    oauthError === "calendar_scope"
      ? t("login.calendarScopeError")
      : oauthError === "google"
        ? t("login.googleError")
        : undefined;

  // Erro de OAuth (vindo da URL) tem prioridade; caso contrário, erro do login.
  const serverError = urlError ?? loginError;

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
      <a className={styles.googleButton} href={apiRoutes.googleStart}>
        <svg
          className={styles.googleIcon}
          width="18"
          height="18"
          viewBox="0 0 18 18"
          aria-hidden="true"
        >
          <path
            fill="#4285F4"
            d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"
          />
          <path
            fill="#34A853"
            d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.02-3.7H.96v2.34A9 9 0 0 0 9 18z"
          />
          <path
            fill="#FBBC05"
            d="M3.98 10.72a5.4 5.4 0 0 1 0-3.44V4.94H.96a9 9 0 0 0 0 8.12l3.02-2.34z"
          />
          <path
            fill="#EA4335"
            d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.94l3.02 2.34C4.68 5.16 6.66 3.58 9 3.58z"
          />
        </svg>
        {t("login.google")}
      </a>
      <div className={styles.divider}>{t("login.or")}</div>
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
