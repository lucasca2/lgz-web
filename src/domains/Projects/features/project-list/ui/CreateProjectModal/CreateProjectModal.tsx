"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/Button";
import { TextField } from "@/shared/ui/TextField";
import { Textarea } from "@/shared/ui/Textarea";
import { Modal } from "@/shared/ui/Modal";
import { useCreateProject, useUpdateProject } from "../../hooks";
import type { ProjectDTO } from "../../types";
import styles from "./CreateProjectModal.module.css";

type FieldErrors = { name?: string };

type CreateProjectModalProps = {
  open: boolean;
  onClose: () => void;
  /** Quando presente, o modal entra em modo de edição. */
  project?: ProjectDTO | null;
};

export function CreateProjectModal({
  open,
  onClose,
  project,
}: CreateProjectModalProps) {
  const t = useTranslations("Projects");
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const isEdit = Boolean(project);
  const mutation = isEdit ? updateProject : createProject;

  const [name, setName] = useState("");
  const [expectation, setExpectation] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  // Sincroniza os campos ao abrir (pré-preenche na edição, limpa na criação).
  useEffect(() => {
    if (!open) return;
    setName(project?.name ?? "");
    setExpectation(project?.expectation ?? "");
    setErrors({});
    createProject.reset();
    updateProject.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, project]);

  function handleClose() {
    if (mutation.isPending) return;
    onClose();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mutation.isPending) return;

    // Só o nome é obrigatório; o contexto é opcional.
    if (!name.trim()) {
      setErrors({ name: t("errors.required") });
      return;
    }
    setErrors({});

    const payload = { name: name.trim(), expectation: expectation.trim() };

    if (isEdit && project) {
      updateProject.mutate(
        { id: project.id, ...payload },
        { onSuccess: onClose },
      );
    } else {
      createProject.mutate(payload, { onSuccess: onClose });
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEdit ? t("form.editTitle") : t("form.title")}
    >
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {mutation.isError ? (
          <p className={styles.banner} role="alert">
            {t("errors.generic")}
          </p>
        ) : null}

        <TextField
          label={t("fields.name")}
          name="name"
          placeholder={t("fields.namePlaceholder")}
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={errors.name}
        />
        <Textarea
          label={t("fields.expectation")}
          name="expectation"
          placeholder={t("fields.expectationPlaceholder")}
          value={expectation}
          onChange={(event) => setExpectation(event.target.value)}
          rows={5}
        />

        <div className={styles.actions}>
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={mutation.isPending}
          >
            {t("form.cancel")}
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            {isEdit ? t("form.save") : t("form.submit")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
