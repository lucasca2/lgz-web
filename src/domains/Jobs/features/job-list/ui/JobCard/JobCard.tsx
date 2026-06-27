"use client";

import { useLocale, useTranslations } from "next-intl";
import type { JobDTO } from "../../types";
import type { JobStatus } from "../../schemas/jobSchemas";
import styles from "./JobCard.module.css";

const statusClass: Record<JobStatus, string> = {
  Aberta: styles.statusOpen,
  Fechada: styles.statusClosed,
  "Stand-by": styles.statusStandby,
  Cancelada: styles.statusCanceled,
};

type JobCardProps = {
  job: JobDTO;
};

export function JobCard({ job }: JobCardProps) {
  const t = useTranslations("Jobs");
  const locale = useLocale();

  const openedAt = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(job.openedAt));

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{job.title}</h3>
        <span className={[styles.status, statusClass[job.status]].join(" ")}>
          {t(`status.${job.status}`)}
        </span>
      </div>
      <p className={styles.project}>{job.project}</p>
      <p className={styles.meta}>
        {t("openedAtLabel")}: {openedAt}
      </p>
    </article>
  );
}
