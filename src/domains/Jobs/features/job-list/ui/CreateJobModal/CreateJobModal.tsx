"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/Button";
import { Select } from "@/shared/ui/Select";
import { TextField } from "@/shared/ui/TextField";
import { Textarea } from "@/shared/ui/Textarea";
import { Modal } from "@/shared/ui/Modal";
import { usePositions } from "@/domains/Positions/features/position-list/hooks";
import { useProjects } from "@/domains/Projects/features/project-list/hooks";
import { useCreateJob, useUsuarios } from "../../hooks";
import { JOB_STATUSES, type JobStatus } from "../../schemas/jobSchemas";
import styles from "./CreateJobModal.module.css";

const dotClass: Record<JobStatus, string> = {
  Aberta: styles.dotOpen,
  Fechada: styles.dotClosed,
  "Stand-by": styles.dotStandby,
  Cancelada: styles.dotCanceled,
};

type FieldErrors = { position?: string; project?: string };

type CreateJobModalProps = {
  open: boolean;
  onClose: () => void;
};

export function CreateJobModal({ open, onClose }: CreateJobModalProps) {
  const t = useTranslations("Jobs");
  const createJob = useCreateJob();
  const { data: positions } = usePositions();
  const { data: projects } = useProjects();
  const { data: usuarios } = useUsuarios();

  const [posicaoId, setPosicaoId] = useState("");
  const [project, setProject] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<JobStatus>("Aberta");
  const [budget, setBudget] = useState("");
  const [prioridade, setPrioridade] = useState("");
  const [hiringManagerId, setHiringManagerId] = useState("");
  const [dataFechamento, setDataFechamento] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  function reset() {
    setPosicaoId("");
    setProject("");
    setDescription("");
    setStatus("Aberta");
    setBudget("");
    setPrioridade("");
    setHiringManagerId("");
    setDataFechamento("");
    setErrors({});
    createJob.reset();
  }

  function handleClose() {
    if (createJob.isPending) return;
    reset();
    onClose();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (createJob.isPending) return;

    const next: FieldErrors = {};
    if (!posicaoId) next.position = t("errors.required");
    if (!project) next.project = t("errors.required");

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    // O título da vaga deriva da posição selecionada (nome + nível); o vínculo
    // real é o `posicaoId` (FK). Descrição e os campos extras são opcionais.
    const selectedPos = (positions ?? []).find((p) => p.id === posicaoId);
    const title = selectedPos
      ? `${selectedPos.name} - ${selectedPos.nivel}`
      : "";

    const budgetNum = budget.trim() ? Number(budget) : undefined;
    const prioridadeNum = prioridade.trim() ? Number(prioridade) : undefined;

    createJob.mutate(
      {
        title,
        project,
        status,
        description: description.trim() || undefined,
        posicaoId,
        budget:
          budgetNum !== undefined && Number.isFinite(budgetNum)
            ? budgetNum
            : undefined,
        prioridade:
          prioridadeNum !== undefined && Number.isFinite(prioridadeNum)
            ? Math.trunc(prioridadeNum)
            : undefined,
        hiringManagerId: hiringManagerId || undefined,
        dataFechamento: dataFechamento || undefined,
      },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      },
    );
  }

  return (
    <Modal open={open} onClose={handleClose} title={t("form.title")}>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {createJob.isError ? (
          <p className={styles.banner} role="alert">
            {t("errors.generic")}
          </p>
        ) : null}

        <Select
          label={t("fields.position")}
          name="position"
          placeholder={t("fields.selectPlaceholder")}
          value={posicaoId}
          onChange={setPosicaoId}
          error={errors.position}
          options={(positions ?? []).map((item) => ({
            value: item.id,
            label: `${item.name} - ${item.nivel}`,
          }))}
        />
        <Select
          label={t("fields.project")}
          name="project"
          placeholder={t("fields.selectPlaceholder")}
          value={project}
          onChange={setProject}
          error={errors.project}
          options={(projects ?? []).map((item) => ({
            value: item.name,
            label: item.name,
          }))}
        />
        <Select
          label={t("fields.status")}
          name="status"
          value={status}
          onChange={(next) => setStatus(next as JobStatus)}
          options={JOB_STATUSES.map((value) => ({
            value,
            label: t(`status.${value}`),
            icon: <span className={`${styles.dot} ${dotClass[value]}`} />,
          }))}
        />
        <Textarea
          label={t("fields.description")}
          name="description"
          placeholder={t("fields.descriptionPlaceholder")}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={5}
        />
        <Select
          label={t("fields.hiringManager")}
          name="hiringManager"
          placeholder={t("fields.selectPlaceholder")}
          value={hiringManagerId}
          onChange={setHiringManagerId}
          options={(usuarios ?? []).map((u) => ({ value: u.id, label: u.nome }))}
        />
        <TextField
          label={t("fields.budget")}
          name="budget"
          type="number"
          min={0}
          step="0.01"
          inputMode="decimal"
          value={budget}
          onChange={(event) => setBudget(event.target.value)}
        />
        <TextField
          label={t("fields.prioridade")}
          name="prioridade"
          type="number"
          min={1}
          max={5}
          step={1}
          value={prioridade}
          onChange={(event) => setPrioridade(event.target.value)}
        />
        <TextField
          label={t("fields.dataFechamento")}
          name="dataFechamento"
          type="date"
          value={dataFechamento}
          onChange={(event) => setDataFechamento(event.target.value)}
        />

        <div className={styles.actions}>
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={createJob.isPending}
          >
            {t("form.cancel")}
          </Button>
          <Button type="submit" loading={createJob.isPending}>
            {t("form.submit")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
