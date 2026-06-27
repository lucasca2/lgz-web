"use client";

import { useTranslations } from "next-intl";
import { Badge, type BadgeVariant } from "@/shared/ui/Badge";
import type { AnalysisJson, Intensidade } from "../../types";
import styles from "./AnalysisPanel.module.css";

const positiveVariant: Record<Intensidade, BadgeVariant> = {
  alta: "positive",
  media: "warn",
  baixa: "neutral",
};

const negativeVariant: Record<Intensidade, BadgeVariant> = {
  alta: "negative",
  media: "warn",
  baixa: "neutral",
};

export function AnalysisPanel({ analysis }: { analysis: AnalysisJson }) {
  const t = useTranslations("Assessments");

  return (
    <div className={styles.panel}>
      <section className={styles.block}>
        <h3 className={styles.blockTitle}>{t("analysis.summary")}</h3>
        <p className={styles.summary}>{analysis.resumo_perfil}</p>
      </section>

      <section className={styles.block}>
        <h3 className={styles.blockTitle}>{t("analysis.generalAspects")}</h3>
        <ul className={styles.aspects}>
          {analysis.aspectos_comportamentais_gerais.map((item, index) => (
            <li key={`g-${index}`} className={styles.aspect}>
              <div className={styles.aspectHeader}>
                <span className={styles.aspectName}>{item.aspecto}</span>
                <Badge variant={positiveVariant[item.intensidade] ?? "neutral"}>
                  {t(`intensity.${item.intensidade}`)}
                </Badge>
              </div>
              <p className={styles.evidence}>{item.evidencia}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.block}>
        <h3 className={styles.blockTitle}>{t("analysis.negativeAspects")}</h3>
        {analysis.aspectos_comportamentais_negativos.length === 0 ? (
          <p className={styles.muted}>{t("analysis.noNegatives")}</p>
        ) : (
          <ul className={styles.aspects}>
            {analysis.aspectos_comportamentais_negativos.map((item, index) => (
              <li key={`n-${index}`} className={styles.aspect}>
                <div className={styles.aspectHeader}>
                  <span className={styles.aspectName}>{item.aspecto}</span>
                  <Badge variant={negativeVariant[item.severidade] ?? "neutral"}>
                    {t(`severity.${item.severidade}`)}
                  </Badge>
                </div>
                <p className={styles.evidence}>{item.evidencia}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
