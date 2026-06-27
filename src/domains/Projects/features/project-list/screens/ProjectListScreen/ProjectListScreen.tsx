"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/Button";
import { PlusIcon } from "@/shared/ui/icons";
import { ProjectList } from "../../ui/ProjectList";
import { CreateProjectModal } from "../../ui/CreateProjectModal";
import styles from "./ProjectListScreen.module.css";

export function ProjectListScreen() {
  const t = useTranslations("Projects");
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

      <ProjectList />

      <CreateProjectModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
