"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/Button";
import { Select } from "@/shared/ui/Select";
import { Textarea } from "@/shared/ui/Textarea";
import { Modal } from "@/shared/ui/Modal";
import { usePositions } from "@/domains/Positions/features/position-list/hooks";
import { useProjects } from "@/domains/Projects/features/project-list/hooks";
import { useCreateJob } from "../../hooks";
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

  const [position, setPosition] = useState("");
  const [project, setProject] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<JobStatus>("Aberta");
  const [errors, setErrors] = useState<FieldErrors>({});

  function reset() {
    setPosition("");
    setProject("");
    setDescription("");
    setStatus("Aberta");
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
    if (!position) next.position = t("errors.required");
    if (!project) next.project = t("errors.required");

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    // Guardamos o nome da posição como `title` da vaga. Descrição é opcional:
    // string vazia vira `undefined` (o schema/back-end trata como ausente).
    createJob.mutate(
      { title: position, project, status, description: description.trim() || undefined },
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
          value={position}
          onChange={setPosition}
          error={errors.position}
          options={(positions ?? []).map((item) => ({
            value: `${item.name} - ${item.nivel}`,
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
