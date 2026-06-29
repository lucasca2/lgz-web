"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/Button";
import { TextField } from "@/shared/ui/TextField";
import { Select } from "@/shared/ui/Select";
import { Textarea } from "@/shared/ui/Textarea";
import { Modal } from "@/shared/ui/Modal";
import { useCandidatoForEdit, useUpdateCandidato } from "../../hooks";
import { ORIGEM_OPTIONS } from "../../constants";
import type { Origem } from "../../schemas/candidatoSchemas";
import type { CandidatoEditDTO } from "../../types";
import styles from "./EditCandidateModal.module.css";

type FieldErrors = { nome?: string; linkedin_url?: string };

type EditCandidateModalProps = {
  candidatoId: string | null;
  open: boolean;
  onClose: () => void;
  // Recebe o candidato atualizado (ex.: para refletir o nome novo na tela-mãe).
  onSaved?: (candidato: CandidatoEditDTO) => void;
};

export function EditCandidateModal({
  candidatoId,
  open,
  onClose,
  onSaved,
}: EditCandidateModalProps) {
  const t = useTranslations("JobCandidates");
  const query = useCandidatoForEdit(candidatoId, open);

  return (
    <Modal open={open} onClose={onClose} title={t("form.editTitle")}>
      {query.isPending ? (
        <p className={styles.hint}>{t("edit.loading")}</p>
      ) : query.isError || !query.data ? (
        <p className={styles.banner} role="alert">
          {t("edit.loadError")}
        </p>
      ) : (
        <EditCandidateForm
          key={query.data.id}
          candidato={query.data}
          onClose={onClose}
          onSaved={onSaved}
        />
      )}
    </Modal>
  );
}

function EditCandidateForm({
  candidato,
  onClose,
  onSaved,
}: {
  candidato: CandidatoEditDTO;
  onClose: () => void;
  onSaved?: (candidato: CandidatoEditDTO) => void;
}) {
  const t = useTranslations("JobCandidates");
  const update = useUpdateCandidato();

  const [nome, setNome] = useState(candidato.nome);
  const [linkedinUrl, setLinkedinUrl] = useState(candidato.linkedinUrl);
  const [email, setEmail] = useState(candidato.email ?? "");
  const [telefone, setTelefone] = useState(candidato.telefone ?? "");
  const [origem, setOrigem] = useState<string>(candidato.origem ?? "");
  const [pretensao, setPretensao] = useState(
    candidato.pretensaoSalarial != null ? String(candidato.pretensaoSalarial) : "",
  );
  const [dadosExtraidos, setDadosExtraidos] = useState(
    candidato.dadosExtraidos ?? "",
  );
  const [errors, setErrors] = useState<FieldErrors>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (update.isPending) return;

    const next: FieldErrors = {};
    if (nome.trim().length < 2) next.nome = t("errors.required");
    if (!linkedinUrl.trim()) next.linkedin_url = t("errors.required");
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    update.mutate(
      {
        id: candidato.id,
        input: {
          nome: nome.trim(),
          linkedin_url: linkedinUrl.trim(),
          email: email.trim() || undefined,
          telefone: telefone.trim() || undefined,
          origem: origem ? (origem as Origem) : undefined,
          pretensao_salarial: pretensao ? Number(pretensao) : undefined,
          dados_extraidos: dadosExtraidos.trim() || undefined,
        },
      },
      {
        onSuccess: (saved) => {
          onSaved?.(saved);
          onClose();
        },
      },
    );
  }

  const code = (update.error as { code?: string } | null)?.code;
  const errorMsg =
    code === "linkedin_taken"
      ? t("errors.linkedinTaken")
      : code === "email_taken"
        ? t("errors.emailTaken")
        : t("errors.generic");

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {update.isError ? (
        <p className={styles.banner} role="alert">
          {errorMsg}
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
      <Textarea
        label={t("fields.dadosExtraidos")}
        name="dados_extraidos"
        placeholder={t("fields.dadosExtraidosPlaceholder")}
        value={dadosExtraidos}
        onChange={(e) => setDadosExtraidos(e.target.value)}
        rows={5}
      />

      <div className={styles.actions}>
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          disabled={update.isPending}
        >
          {t("form.cancel")}
        </Button>
        <Button type="submit" loading={update.isPending}>
          {t("form.save")}
        </Button>
      </div>
    </form>
  );
}
