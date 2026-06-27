"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import type { JobDTO } from "../../types";
import type { JobStatus } from "../../schemas/jobSchemas";
import { useUpdateJobStatus } from "../../hooks";
import { JobStatusMenu } from "../JobStatusMenu";
import styles from "./JobCard.module.css";

type JobCardProps = {
  job: JobDTO;
};

export function JobCard({ job }: JobCardProps) {
  const t = useTranslations("Jobs");
  const locale = useLocale();
  const updateStatus = useUpdateJobStatus();

  const openedAt = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(job.openedAt));

  return (
    <Link href={`/jobs/${job.id}`} className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{job.title}</h3>
        <JobStatusMenu
          value={job.status}
          disabled={updateStatus.isPending}
          onChange={(status: JobStatus) =>
            updateStatus.mutate({ id: job.id, status })
          }
        />
      </div>
      <p className={styles.project}>{job.project}</p>
      {job.description ? (
        <p className={styles.description}>{job.description}</p>
      ) : null}
      <p className={styles.meta}>
        {t("openedAtLabel")}: {openedAt}
      </p>
    </Link>
  );
}
