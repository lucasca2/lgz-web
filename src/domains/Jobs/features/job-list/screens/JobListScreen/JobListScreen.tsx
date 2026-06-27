"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/Button";
import { PlusIcon } from "@/shared/ui/icons";
import { JobList } from "../../ui/JobList";
import { CreateJobModal } from "../../ui/CreateJobModal";
import styles from "./JobListScreen.module.css";

export function JobListScreen() {
  const t = useTranslations("Jobs");
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{t("title")}</h1>
          <p className={styles.subtitle}>{t("subtitle")}</p>
        </div>
        <Button size="md" onClick={() => setIsModalOpen(true)}>
          <PlusIcon />
          {t("create")}
        </Button>
      </header>

      <JobList />

      <CreateJobModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
