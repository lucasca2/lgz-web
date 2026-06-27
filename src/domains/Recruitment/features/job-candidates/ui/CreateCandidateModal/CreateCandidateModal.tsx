"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/Button";
import { TextField } from "@/shared/ui/TextField";
import { Select } from "@/shared/ui/Select";
import { Modal } from "@/shared/ui/Modal";
import { useCreateJobCandidate } from "../../hooks";
import { ORIGEM_OPTIONS } from "../../constants";
import type { Origem } from "../../schemas/candidatoSchemas";
import styles from "./CreateCandidateModal.module.css";

type FieldErrors = { nome?: string; linkedin_url?: string };

type CreateCandidateModalProps = {
  vagaId: string;
  open: boolean;
  onClose: () => void;
};

export function CreateCandidateModal({
  vagaId,
  open,
  onClose,
}: CreateCandidateModalProps) {
  const t = useTranslations("JobCandidates");
  const createCandidate = useCreateJobCandidate(vagaId);

  const [nome, setNome] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [origem, setOrigem] = useState("");
  const [pretensao, setPretensao] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  function reset() {
    setNome("");
    setLinkedinUrl("");
    setEmail("");
    setTelefone("");
    setOrigem("");
    setPretensao("");
    setErrors({});
    createCandidate.reset();
  }

  function handleClose() {
    if (createCandidate.isPending) return;
    reset();
    onClose();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (createCandidate.isPending) return;

    const next: FieldErrors = {};
    if (nome.trim().length < 2) next.nome = t("errors.required");
    if (!linkedinUrl.trim()) next.linkedin_url = t("errors.required");

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    createCandidate.mutate(
      {
        nome: nome.trim(),
        linkedin_url: linkedinUrl.trim(),
        email: email.trim() || undefined,
        telefone: telefone.trim() || undefined,
        origem: origem ? (origem as Origem) : undefined,
        pretensao_salarial: pretensao ? Number(pretensao) : undefined,
      },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      },
    );
  }

  const errorStatus = (createCandidate.error as { status?: number } | null)
    ?.status;
  const errorMessage =
    errorStatus === 409 ? t("errors.alreadyInJob") : t("errors.generic");

  return (
    <Modal open={open} onClose={handleClose} title={t("form.title")}>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {createCandidate.isError ? (
          <p className={styles.banner} role="alert">
            {errorMessage}
          </p>
        ) : null}

        <TextField
          label={t("fields.nome")}
          name="nome"
          placeholder={t("fields.nomePlaceholder")}
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          error={errors.nome}
        />
        <TextField
          label={t("fields.linkedin")}
          name="linkedin_url"
          type="url"
          placeholder={t("fields.linkedinPlaceholder")}
          value={linkedinUrl}
          onChange={(e) => setLinkedinUrl(e.target.value)}
          error={errors.linkedin_url}
        />
        <TextField
          label={t("fields.email")}
          name="email"
          type="email"
          placeholder={t("fields.emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label={t("fields.telefone")}
          name="telefone"
          placeholder={t("fields.telefonePlaceholder")}
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
        />
        <Select
          label={t("fields.origem")}
          name="origem"
          placeholder={t("fields.selectPlaceholder")}
          value={origem}
          onChange={setOrigem}
          options={ORIGEM_OPTIONS.map((value) => ({
            value,
            label: t(`origem.${value}`),
          }))}
        />
        <TextField
          label={t("fields.pretensao")}
          name="pretensao_salarial"
          type="number"
          min={0}
          placeholder={t("fields.pretensaoPlaceholder")}
          value={pretensao}
          onChange={(e) => setPretensao(e.target.value)}
        />

        <div className={styles.actions}>
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={createCandidate.isPending}
          >
            {t("form.cancel")}
          </Button>
          <Button type="submit" loading={createCandidate.isPending}>
            {t("form.submit")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
