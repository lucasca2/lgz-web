"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/Button";
import { TextField } from "@/shared/ui/TextField";
import { Textarea } from "@/shared/ui/Textarea";
import { Select } from "@/shared/ui/Select";
import { Modal } from "@/shared/ui/Modal";
import { useCreatePosition, useUpdatePosition } from "../../hooks";
import { NIVEIS, type Nivel } from "../../constants/niveis";
import type { PositionDTO } from "../../types";
import styles from "./CreatePositionModal.module.css";

type FieldErrors = { name?: string; descricao?: string };

type CreatePositionModalProps = {
  open: boolean;
  onClose: () => void;
  /** Quando presente, o modal entra em modo de edição. */
  position?: PositionDTO | null;
};

export function CreatePositionModal({
  open,
  onClose,
  position,
}: CreatePositionModalProps) {
  const t = useTranslations("Positions");
  const createPosition = useCreatePosition();
  const updatePosition = useUpdatePosition();
  const isEdit = Boolean(position);
  const mutation = isEdit ? updatePosition : createPosition;

  const [name, setName] = useState("");
  const [nivel, setNivel] = useState<Nivel>("Junior");
  const [descricao, setDescricao] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  const nivelOptions = useMemo(
    () => NIVEIS.map((value) => ({ value, label: t(`levels.${value}`) })),
    [t],
  );

  // Sincroniza os campos ao abrir (pré-preenche na edição, limpa na criação).
  useEffect(() => {
    if (!open) return;
    setName(position?.name ?? "");
    setNivel(position?.nivel ?? "Junior");
    setDescricao(position?.descricao ?? "");
    setErrors({});
    createPosition.reset();
    updatePosition.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, position]);

  function handleClose() {
    if (mutation.isPending) return;
    onClose();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mutation.isPending) return;

    const next: FieldErrors = {};
    if (!name.trim()) next.name = t("errors.required");
    if (!descricao.trim()) next.descricao = t("errors.required");

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const payload = { name: name.trim(), nivel, descricao: descricao.trim() };

    if (isEdit && position) {
      updatePosition.mutate(
        { id: position.id, ...payload },
        { onSuccess: onClose },
      );
    } else {
      createPosition.mutate(payload, { onSuccess: onClose });
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
        <Select
          label={t("fields.level")}
          name="nivel"
          value={nivel}
          onChange={(value) => setNivel(value as Nivel)}
          options={nivelOptions}
        />
        <Textarea
          label={t("fields.descricao")}
          name="descricao"
          placeholder={t("fields.descricaoPlaceholder")}
          value={descricao}
          onChange={(event) => setDescricao(event.target.value)}
          error={errors.descricao}
          rows={8}
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
