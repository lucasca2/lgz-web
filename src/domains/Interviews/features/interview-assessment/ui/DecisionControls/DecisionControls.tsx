"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/Button";
import { Textarea } from "@/shared/ui/Textarea";
import { useUpdateAssessment } from "../../hooks";
import type { Decision } from "../../types";
import styles from "./DecisionControls.module.css";

type Props = {
  id: string;
  decision: Decision | null;
  manualJustification: string | null;
};

// Decisão manual (override) — pode confirmar ou divergir da recomendação da IA.
export function DecisionControls({ id, decision, manualJustification }: Props) {
  const t = useTranslations("Assessments");
  const update = useUpdateAssessment();

  const [selected, setSelected] = useState<Decision | null>(decision);
  const [justificativa, setJustificativa] = useState(manualJustification ?? "");

  function save() {
    if (!selected || update.isPending) return;
    update.mutate({ id, decisao: selected, justificativa: justificativa.trim() });
  }

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>{t("decisionControls.title")}</h3>

      <div className={styles.choices}>
        <Button
          type="button"
          size="md"
          variant={selected === "APROVAR" ? "primary" : "ghost"}
          onClick={() => setSelected("APROVAR")}
        >
          {t("decision.APROVAR")}
        </Button>
        <Button
          type="button"
          size="md"
          variant={selected === "REPROVAR" ? "primary" : "ghost"}
          onClick={() => setSelected("REPROVAR")}
        >
          {t("decision.REPROVAR")}
        </Button>
      </div>

      <Textarea
        label={t("decisionControls.justification")}
        name="justificativa"
        placeholder={t("decisionControls.justificationPlaceholder")}
        value={justificativa}
        onChange={(event) => setJustificativa(event.target.value)}
        rows={3}
      />

      <div className={styles.actions}>
        {update.isSuccess ? (
          <span className={styles.saved}>{t("decisionControls.saved")}</span>
        ) : null}
        <Button
          type="button"
          size="md"
          onClick={save}
          loading={update.isPending}
          disabled={!selected}
        >
          {t("decisionControls.save")}
        </Button>
      </div>
    </div>
  );
}
