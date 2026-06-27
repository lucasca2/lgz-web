"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/shared/ui/Badge";
import type { RecommendationJson, SimilarCandidate } from "../../types";
import styles from "./RecommendationPanel.module.css";

export function RecommendationPanel({
  recommendation,
}: {
  recommendation: RecommendationJson;
}) {
  const t = useTranslations("Assessments");
  const approved = recommendation.recomendacao === "APROVAR";
  const confidence = Math.max(0, Math.min(100, recommendation.confianca));

  return (
    <div className={styles.panel}>
      <div className={styles.headline}>
        <Badge variant={approved ? "positive" : "negative"}>
          {t(`decision.${recommendation.recomendacao}`)}
        </Badge>
        <div className={styles.confidence}>
          <div className={styles.confidenceTop}>
            <span className={styles.confidenceLabel}>
              {t("recommendation.confidence")}
            </span>
            <span className={styles.confidenceValue}>{confidence}%</span>
          </div>
          <div className={styles.bar} aria-hidden="true">
            <div
              className={approved ? styles.barFillOk : styles.barFillNo}
              style={{ width: `${confidence}%` }}
            />
          </div>
        </div>
      </div>

      <section className={styles.block}>
        <h3 className={styles.blockTitle}>
          {t("recommendation.justification")}
        </h3>
        <p className={styles.text}>{recommendation.justificativa}</p>
      </section>

      <div className={styles.columns}>
        <section className={styles.block}>
          <h3 className={styles.blockTitle}>{t("recommendation.strengths")}</h3>
          <ul className={styles.list}>
            {recommendation.pontos_fortes.map((point, index) => (
              <li key={`s-${index}`}>{point}</li>
            ))}
          </ul>
        </section>
        <section className={styles.block}>
          <h3 className={styles.blockTitle}>{t("recommendation.attention")}</h3>
          <ul className={styles.list}>
            {recommendation.pontos_de_atencao.map((point, index) => (
              <li key={`a-${index}`}>{point}</li>
            ))}
          </ul>
        </section>
      </div>

      <SimilarBlock
        title={t("recommendation.similarApproved")}
        items={recommendation.candidatos_similares_aprovados}
        empty={t("recommendation.noSimilar")}
      />
      <SimilarBlock
        title={t("recommendation.similarRejected")}
        items={recommendation.candidatos_similares_reprovados}
        empty={t("recommendation.noSimilar")}
      />
    </div>
  );
}

function SimilarBlock({
  title,
  items,
  empty,
}: {
  title: string;
  items: SimilarCandidate[];
  empty: string;
}) {
  return (
    <section className={styles.block}>
      <h3 className={styles.blockTitle}>{title}</h3>
      {items.length === 0 ? (
        <p className={styles.muted}>{empty}</p>
      ) : (
        <ul className={styles.similars}>
          {items.map((item, index) => (
            <li key={`${item.nome}-${index}`} className={styles.similar}>
              <span className={styles.similarName}>{item.nome}</span>
              <span className={styles.similarText}>{item.similaridades}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
