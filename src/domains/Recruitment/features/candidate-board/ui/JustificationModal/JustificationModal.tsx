"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Modal } from "@/shared/ui/Modal";
import { Textarea } from "@/shared/ui/Textarea";
import { Button } from "@/shared/ui/Button";
import type { BoardStage } from "../../constants/stages";
import styles from "./JustificationModal.module.css";

type JustificationModalProps = {
  fromStage: BoardStage;
  toStage: BoardStage;
  loading?: boolean;
  error?: boolean;
  onConfirm: (justificativa: string) => void;
  onCancel: () => void;
};

// Modal exigido ao mover um card entre colunas: a justificativa é obrigatória e
// vira a transição registrada no histórico (e o campo de decisão nas colunas terminais).
export function JustificationModal({
  fromStage,
  toStage,
  loading,
  error,
  onConfirm,
  onCancel,
}: JustificationModalProps) {
  const t = useTranslations("Dashboard");
  const tStages = useTranslations("Dashboard.stages");
  const [text, setText] = useState("");

  const valid = text.trim().length >= 3;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!valid || loading) return;
    onConfirm(text.trim());
  }

  return (
    <Modal open onClose={onCancel} title={t("moveJustifyTitle")}>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <p className={styles.hint}>
          {t("moveJustifyHint", {
            from: tStages(fromStage),
            to: tStages(toStage),
          })}
        </p>
        <Textarea
          label={t("moveJustifyLabel")}
          name="justificativa"
          placeholder={t("moveJustifyPlaceholder")}
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={4}
        />
        {error ? (
          <p className={styles.error} role="alert">
            {t("moveError")}
          </p>
        ) : null}
        <div className={styles.actions}>
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={loading}
          >
            {t("moveCancel")}
          </Button>
          <Button type="submit" loading={loading} disabled={!valid}>
            {t("moveConfirm")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
