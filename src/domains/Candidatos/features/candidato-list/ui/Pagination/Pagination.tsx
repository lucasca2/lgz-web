"use client";

import { useTranslations } from "next-intl";
import styles from "./Pagination.module.css";

type Props = {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ page, totalPages, total, onPageChange }: Props) {
  const t = useTranslations("Candidatos.pagination");

  return (
    <div className={styles.root}>
      <span className={styles.summary}>
        {t("summary", { count: total, page, total: totalPages })}
      </span>

      <div className={styles.controls}>
        <button
          className={styles.btn}
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label={t("prev")}
        >
          ‹ {t("prev")}
        </button>
        <button
          className={styles.btn}
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label={t("next")}
        >
          {t("next")} ›
        </button>
      </div>
    </div>
  );
}
