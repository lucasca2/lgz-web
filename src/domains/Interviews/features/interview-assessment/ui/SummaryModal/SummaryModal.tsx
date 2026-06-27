"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Modal } from "@/shared/ui/Modal";
import { Button } from "@/shared/ui/Button";
import { useSummary } from "../../hooks";
import type { AssessmentDTO } from "../../types";
import styles from "./SummaryModal.module.css";

type Props = {
  open: boolean;
  onClose: () => void;
  assessment: AssessmentDTO;
};

export function SummaryModal({ open, onClose, assessment }: Props) {
  const t = useTranslations("Assessments");
  const summary = useSummary();
  const [copied, setCopied] = useState(false);
  const content = assessment.summaryMarkdown;

  async function copy() {
    if (!content) return;
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Modal open={open} onClose={onClose} title={t("summary.title")}>
      <div className={styles.body}>
        {summary.isError ? (
          <p className={styles.banner} role="alert">
            {t("errors.generic")}
          </p>
        ) : null}

        {content ? (
          <pre className={styles.content}>{content}</pre>
        ) : (
          <p className={styles.muted}>{t("summary.empty")}</p>
        )}

        <div className={styles.actions}>
          {content ? (
            <Button type="button" variant="ghost" size="md" onClick={copy}>
              {copied ? t("copied") : t("copy")}
            </Button>
          ) : null}
          <Button
            type="button"
            size="md"
            loading={summary.isPending}
            onClick={() => summary.mutate(assessment.id)}
          >
            {content ? t("summary.regenerate") : t("summary.generate")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
