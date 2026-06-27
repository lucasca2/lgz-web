"use client";

import { useTranslations } from "next-intl";
import { CandidateBoard } from "../../ui/CandidateBoard";
import styles from "./CandidateBoardScreen.module.css";

export function CandidateBoardScreen() {
  const t = useTranslations("Dashboard");

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t("title")}</h1>
        <p className={styles.subtitle}>{t("subtitle")}</p>
      </header>

      <CandidateBoard />
    </div>
  );
}
