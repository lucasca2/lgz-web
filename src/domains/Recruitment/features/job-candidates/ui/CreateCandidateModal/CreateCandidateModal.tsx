"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/Button";
import { TextField } from "@/shared/ui/TextField";
import { Select } from "@/shared/ui/Select";
import { Textarea } from "@/shared/ui/Textarea";
import { Modal } from "@/shared/ui/Modal";
import {
  useCreateJobCandidate,
  useLinkCandidate,
  useSearchCandidatos,
  useUpdateCandidato,
} from "../../hooks";
import { ORIGEM_OPTIONS } from "../../constants";
import type { Origem } from "../../schemas/candidatoSchemas";
import type { CandidatoEditDTO } from "../../types";
import styles from "./CreateCandidateModal.module.css";

type Mode = "search" | "new";
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
  const [mode, setMode] = useState<Mode>("search");

  // ── Busca ──
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(id);
  }, [q]);
  const search = useSearchCandidatos(debouncedQ);
  const link = useLinkCandidate(vagaId);

  // ── Cadastro novo / edição de existente ──
  const createCandidate = useCreateJobCandidate(vagaId);
  const updateCandidate = useUpdateCandidato();
  const [nome, setNome] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [origem, setOrigem] = useState("");
  const [pretensao, setPretensao] = useState("");
  const [dadosExtraidos, setDadosExtraidos] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  // Candidato já existente na base (detectado pelo linkedin no blur). Quando
  // setado, salvar = atualizar os dados dele + vincular à vaga.
  const [existing, setExisting] = useState<CandidatoEditDTO | null>(null);
  const [looking, setLooking] = useState(false);

  function fullReset() {
    setMode("search");
    setQ("");
    setDebouncedQ("");
    setNome("");
    setLinkedinUrl("");
    setEmail("");
    setTelefone("");
    setOrigem("");
    setPretensao("");
    setDadosExtraidos("");
    setErrors({});
    setExisting(null);
    setLooking(false);
    createCandidate.reset();
    updateCandidate.reset();
    link.reset();
  }

  const busy =
    createCandidate.isPending || updateCandidate.isPending || link.isPending;

  function handleClose() {
    if (busy) return;
    fullReset();
    onClose();
  }

  function done() {
    fullReset();
    onClose();
  }

  function handleLink(candidatoId: string) {
    link.mutate(candidatoId, { onSuccess: done });
  }

  function handleLinkedinChange(value: string) {
    setLinkedinUrl(value);
    // Editou o linkedin pra longe do candidato casado → volta ao modo "novo".
    if (existing && existing.linkedinUrl !== value.trim()) setExisting(null);
  }

  // No blur do linkedin: se já existir um candidato com aquele linkedin,
  // pré-preenche o formulário com os dados dele (pra editar o que precisar).
  async function handleLinkedinBlur() {
    const url = linkedinUrl.trim();
    if (!url || (existing && existing.linkedinUrl === url)) return;
    setLooking(true);
    try {
      const res = await fetch(
        `/api/candidatos/lookup?linkedin=${encodeURIComponent(url)}`,
      );
      const data: CandidatoEditDTO | null = res.ok ? await res.json() : null;
      if (data) {
        setExisting(data);
        setNome(data.nome);
        setEmail(data.email ?? "");
        setTelefone(data.telefone ?? "");
        setOrigem(data.origem ?? "");
        setPretensao(
          data.pretensaoSalarial != null ? String(data.pretensaoSalarial) : "",
        );
        setDadosExtraidos(data.dadosExtraidos ?? "");
        setErrors({});
      } else {
        setExisting(null);
      }
    } catch {
      setExisting(null);
    } finally {
      setLooking(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    const next: FieldErrors = {};
    if (nome.trim().length < 2) next.nome = t("errors.required");
    if (!linkedinUrl.trim()) next.linkedin_url = t("errors.required");
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const input = {
      nome: nome.trim(),
      linkedin_url: linkedinUrl.trim(),
      email: email.trim() || undefined,
      telefone: telefone.trim() || undefined,
      origem: origem ? (origem as Origem) : undefined,
      pretensao_salarial: pretensao ? Number(pretensao) : undefined,
      dados_extraidos: dadosExtraidos.trim() || undefined,
    };

    if (existing) {
      // Atualiza os dados do candidato e o vincula à vaga.
      updateCandidate.mutate(
        { id: existing.id, input },
        {
          onSuccess: () => {
            link.mutate(existing.id, {
              onSuccess: done,
              // Já está na vaga: os dados já foram salvos → fecha mesmo assim.
              onError: (err) => {
                if ((err as { code?: string }).code === "already_in_job") done();
              },
            });
          },
        },
      );
      return;
    }

    createCandidate.mutate(input, {
      onSuccess: done,
      onError: (err) => {
        // Já existe na base → manda pra busca pré-preenchida pra vincular.
        if ((err as { code?: string }).code === "candidato_exists") {
          setQ(linkedinUrl.trim());
          setMode("search");
        }
      },
    });
  }

  const linkCode = (link.error as { code?: string } | null)?.code;
  const linkErrorMsg =
    linkCode === "already_in_job"
      ? t("errors.alreadyInJob")
      : t("errors.generic");

  // Banner de erro do formulário (criar / atualizar / vincular).
  const formError =
    createCandidate.isError || updateCandidate.isError || link.isError;
  const formErrorCode = (
    (createCandidate.error || updateCandidate.error || link.error) as
      | { code?: string }
      | null
  )?.code;
  const formErrorMsg =
    formErrorCode === "linkedin_taken"
      ? t("errors.linkedinTaken")
      : formErrorCode === "email_taken"
        ? t("errors.emailTaken")
        : formErrorCode === "already_in_job"
          ? t("errors.alreadyInJob")
          : t("errors.generic");

  return (
    <Modal open={open} onClose={handleClose} title={t("form.title")}>
      {mode === "search" ? (
        <div className={styles.form}>
          <TextField
            label={t("search.label")}
            hideLabel
            name="search"
            placeholder={t("search.placeholder")}
            value={q}
            onChange={(event) => setQ(event.target.value)}
            autoFocus
          />

          {link.isError ? (
            <p className={styles.banner} role="alert">
              {linkErrorMsg}
            </p>
          ) : null}

          {debouncedQ.trim().length >= 2 ? (
            search.isPending ? (
              <p className={styles.hint}>{t("search.loading")}</p>
            ) : (search.data ?? []).length === 0 ? (
              <p className={styles.hint}>{t("search.empty")}</p>
            ) : (
              <ul className={styles.results}>
                {(search.data ?? []).map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      className={styles.resultRow}
                      onClick={() => handleLink(c.id)}
                      disabled={busy}
                    >
                      <span className={styles.resultName}>{c.nome}</span>
                      <span className={styles.resultMeta}>
                        {c.linkedinUrl}
                        {" · "}
                        {t("search.inProcesses", { count: c.processosCount })}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )
          ) : (
            <p className={styles.hint}>{t("search.help")}</p>
          )}

          <div className={styles.actions}>
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={busy}
            >
              {t("form.cancel")}
            </Button>
            <Button type="button" onClick={() => setMode("new")} disabled={busy}>
              {t("search.createNew")}
            </Button>
          </div>
        </div>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {formError ? (
            <p className={styles.banner} role="alert">
              {formErrorMsg}
            </p>
          ) : existing ? (
            <p className={styles.existsHint}>{t("duplicate.found")}</p>
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
            onChange={(e) => handleLinkedinChange(e.target.value)}
            onBlur={handleLinkedinBlur}
            error={errors.linkedin_url}
          />
          {looking ? (
            <p className={styles.hint}>{t("duplicate.checking")}</p>
          ) : null}
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
              onClick={() => setMode("search")}
              disabled={busy}
            >
              {t("search.back")}
            </Button>
            <Button type="submit" loading={busy}>
              {existing ? t("duplicate.save") : t("form.submit")}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
