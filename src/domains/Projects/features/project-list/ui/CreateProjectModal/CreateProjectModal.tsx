"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/Button";
import { TextField } from "@/shared/ui/TextField";
import { Textarea } from "@/shared/ui/Textarea";
import { Modal } from "@/shared/ui/Modal";
import { useCreateProject } from "../../hooks";
import styles from "./CreateProjectModal.module.css";

type FieldErrors = { name?: string; expectation?: string };

type CreateProjectModalProps = {
  open: boolean;
  onClose: () => void;
};

export function CreateProjectModal({ open, onClose }: CreateProjectModalProps) {
  const t = useTranslations("Projects");
  const createProject = useCreateProject();

  const [name, setName] = useState("");
  const [expectation, setExpectation] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  function reset() {
    setName("");
    setExpectation("");
    setErrors({});
    createProject.reset();
  }

  function handleClose() {
    if (createProject.isPending) return;
    reset();
    onClose();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (createProject.isPending) return;

    const next: FieldErrors = {};
    if (!name.trim()) next.name = t("errors.required");
    if (!expectation.trim()) next.expectation = t("errors.required");

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    createProject.mutate(
      { name: name.trim(), expectation: expectation.trim() },
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
        {createProject.isError ? (
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
          error={errors.expectation}
          rows={5}
        />

        <div className={styles.actions}>
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={createProject.isPending}
          >
            {t("form.cancel")}
          </Button>
          <Button type="submit" loading={createProject.isPending}>
            {t("form.submit")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
