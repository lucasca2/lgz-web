"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/Button";
import { PlusIcon } from "@/shared/ui/icons";
import type { JobDTO } from "@/domains/Jobs/features/job-list/types";
import { CandidateBoard } from "@/domains/Recruitment/features/candidate-board/ui/CandidateBoard";
import { CreateCandidateModal } from "../../ui/CreateCandidateModal";
import styles from "./JobDetailScreen.module.css";

type JobDetailScreenProps = { job: JobDTO };

export function JobDetailScreen({ job }: JobDetailScreenProps) {
  const t = useTranslations("JobCandidates");
  const tJobs = useTranslations("Jobs");
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className={styles.page}>
      <Link href="/jobs" className={styles.back}>
        ← {tJobs("title")}
      </Link>

      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{job.title}</h1>
          <p className={styles.subtitle}>
            {job.project} · {tJobs(`status.${job.status}`)}
          </p>
        </div>
        <Button size="md" onClick={() => setIsModalOpen(true)}>
          <PlusIcon />
          {t("create")}
        </Button>
      </header>

      <CandidateBoard vagaId={job.id} />

      <CreateCandidateModal
        vagaId={job.id}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
