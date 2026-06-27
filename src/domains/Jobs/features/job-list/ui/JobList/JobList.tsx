"use client";

import { useTranslations } from "next-intl";
import { useJobs } from "../../hooks";
import { JobCard } from "../JobCard";
import styles from "./JobList.module.css";

export function JobList() {
  const t = useTranslations("Jobs");
  const { data: jobs, isPending, isError } = useJobs();

  if (isPending) {
    return <p className={styles.state}>{t("loading")}</p>;
  }

  if (isError) {
    return <p className={styles.stateError}>{t("loadError")}</p>;
  }

  if (jobs.length === 0) {
    return <p className={styles.state}>{t("empty")}</p>;
  }

  return (
    <div className={styles.grid}>
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}
