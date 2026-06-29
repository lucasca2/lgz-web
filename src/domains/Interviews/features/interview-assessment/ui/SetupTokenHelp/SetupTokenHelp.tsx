"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Modal } from "@/shared/ui/Modal";
import { HelpIcon } from "@/shared/ui/icons";
import styles from "./SetupTokenHelp.module.css";

const COMMAND = "claude setup-token";

// Ícone "?" que abre um modal explicando como gerar o setup token, com o
// comando em um snippet copiável.
export function SetupTokenHelp() {
  const t = useTranslations("Settings.setupToken");
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copyCommand() {
    try {
      await navigator.clipboard.writeText(COMMAND);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard pode falhar fora de contexto seguro — ignora.
    }
  }

  return (
    <>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen(true)}
        aria-label={t("helpAria")}
        title={t("helpAria")}
      >
        <HelpIcon className={styles.icon} />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={t("helpTitle")}>
        <div className={styles.content}>
          <p className={styles.text}>{t("helpIntro")}</p>
          <ol className={styles.steps}>
            <li>{t("helpStep1")}</li>
            <li>{t("helpStep2")}</li>
            <li>{t("helpStep3")}</li>
          </ol>
          <div className={styles.snippet}>
            <code className={styles.code}>{COMMAND}</code>
            <button type="button" className={styles.copy} onClick={copyCommand}>
              {copied ? t("copied") : t("copy")}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
