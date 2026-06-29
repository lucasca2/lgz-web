"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Modal } from "@/shared/ui/Modal";
import { Button } from "@/shared/ui/Button";
import styles from "./AiNotConfiguredModal.module.css";

type AiNotConfiguredModalProps = {
  open: boolean;
  onClose: () => void;
};

// Mostrado quando o usuário tenta usar a IA sem credencial configurada.
// Leva para a tela de Configurações.
export function AiNotConfiguredModal({
  open,
  onClose,
}: AiNotConfiguredModalProps) {
  const t = useTranslations("AiGuard");
  const router = useRouter();

  return (
    <Modal open={open} onClose={onClose} title={t("title")}>
      <div className={styles.content}>
        <p className={styles.body}>{t("body")}</p>
        <div className={styles.actions}>
          <Button type="button" variant="ghost" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button
            type="button"
            onClick={() => {
              onClose();
              router.push("/settings");
            }}
          >
            {t("cta")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
