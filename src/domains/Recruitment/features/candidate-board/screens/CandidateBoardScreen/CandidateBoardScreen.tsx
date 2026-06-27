"use client";

import { useTranslations } from "next-intl";
import { CandidateBoard } from "../../ui/CandidateBoard";
import styles from "./CandidateBoardScreen.module.css";

// Título/subtítulo opcionais permitem reusar o board em outra rota (ex.: Entrevistas)
// com cabeçalho próprio. Sem props, usa as strings do namespace Dashboard.
type CandidateBoardScreenProps = {
  title?: string;
  subtitle?: string;
};

export function CandidateBoardScreen({
  title,
  subtitle,
}: CandidateBoardScreenProps) {
  const t = useTranslations("Dashboard");

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{title ?? t("title")}</h1>
        <p className={styles.subtitle}>{subtitle ?? t("subtitle")}</p>
      </header>

      <CandidateBoard />
    </div>
  );
}
