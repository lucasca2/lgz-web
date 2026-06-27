"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Modal } from "@/shared/ui/Modal";
import { Button } from "@/shared/ui/Button";
import { Textarea } from "@/shared/ui/Textarea";
import { useRejectionTemplate } from "../../hooks";
import { buildRejectionMessage } from "../../utils/rejection";
import styles from "./RejectionTemplateModal.module.css";

type Props = {
  open: boolean;
  onClose: () => void;
  id: string;
  candidateName: string;
};

export function RejectionTemplateModal({
  open,
  onClose,
  id,
  candidateName,
}: Props) {
  const t = useTranslations("Assessments");
  const reject = useRejectionTemplate();
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (reject.data?.justificativa) {
      setText(buildRejectionMessage(reject.data.justificativa, candidateName));
    }
  }, [reject.data, candidateName]);

  // Limpa ao reabrir.
  useEffect(() => {
    if (open) {
      setText("");
      reject.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function copy() {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Modal open={open} onClose={onClose} title={t("rejection.title")}>
      <div className={styles.body}>
        {reject.isError ? (
          <p className={styles.banner} role="alert">
            {t("errors.generic")}
          </p>
        ) : null}

        {text ? (
          <Textarea
            label={t("rejection.message")}
            hideLabel
            name="rejection"
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={12}
          />
        ) : (
          <p className={styles.muted}>{t("rejection.empty")}</p>
        )}

        <div className={styles.actions}>
          {text ? (
            <Button type="button" variant="ghost" size="md" onClick={copy}>
              {copied ? t("copied") : t("copy")}
            </Button>
          ) : null}
          <Button
            type="button"
            size="md"
            loading={reject.isPending}
            onClick={() => reject.mutate(id)}
          >
            {text ? t("rejection.regenerate") : t("rejection.generate")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
