"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/Button";
import { TextField } from "@/shared/ui/TextField";
import { AuthCard } from "@/domains/Auth/shared/ui/AuthCard";
import { useSignUp } from "@/domains/Auth/features/sign-up/hooks";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldErrors = { name?: string; email?: string; password?: string };

export function SignUpForm() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const signup = useSignUp();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Bloqueia disparo duplo: enquanto envia E durante o redirect pós-sucesso.
    if (signup.isPending || signup.isSuccess) return;

    const next: FieldErrors = {};
    if (name.trim().length < 2) next.name = t("errors.nameMin");
    if (!EMAIL_RE.test(email.trim())) next.email = t("errors.emailInvalid");
    if (password.length < 8) next.password = t("errors.passwordMin");
    else if (!/[a-zA-Z]/.test(password)) next.password = t("errors.passwordLetter");
    else if (!/[0-9]/.test(password)) next.password = t("errors.passwordNumber");
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    signup.mutate(
      {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      },
      {
        onSuccess: () => {
          router.push("/jobs");
          router.refresh();
        },
      },
    );
  }

  const status = (signup.error as { status?: number } | null)?.status;
  const serverError = signup.isError
    ? status === 409
      ? t("signup.emailTaken")
      : t("errors.generic")
    : undefined;

  return (
    <AuthCard
      title={t("signup.title")}
      subtitle={t("signup.subtitle")}
      error={serverError}
      onSubmit={handleSubmit}
      footer={
        <>
          {t("signup.hasAccount")} <Link href="/login">{t("signup.goLogin")}</Link>
        </>
      }
    >
      <TextField
        label={t("fields.name")}
        hideLabel
        name="name"
        autoComplete="name"
        placeholder={t("fields.name")}
        value={name}
        onChange={(event) => setName(event.target.value)}
        error={errors.name}
      />
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
        autoComplete="new-password"
        placeholder={t("fields.password")}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={errors.password}
      />
      <Button type="submit" fullWidth loading={signup.isPending || signup.isSuccess}>
        {t("signup.submit")}
      </Button>
    </AuthCard>
  );
}
