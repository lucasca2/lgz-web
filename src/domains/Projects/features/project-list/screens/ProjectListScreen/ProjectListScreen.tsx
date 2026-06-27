"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/Button";
import { PlusIcon } from "@/shared/ui/icons";
import { ProjectList } from "../../ui/ProjectList";
import { CreateProjectModal } from "../../ui/CreateProjectModal";
import type { ProjectDTO } from "../../types";
import styles from "./ProjectListScreen.module.css";

export function ProjectListScreen() {
  const t = useTranslations("Projects");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProjectDTO | null>(null);

  function openCreate() {
    setEditing(null);
    setIsModalOpen(true);
  }

  function openEdit(project: ProjectDTO) {
    setEditing(project);
    setIsModalOpen(true);
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{t("title")}</h1>
          <p className={styles.subtitle}>{t("subtitle")}</p>
        </div>
        <Button size="md" onClick={openCreate}>
          <PlusIcon />
          {t("create")}
        </Button>
      </header>

      <ProjectList onEdit={openEdit} />

      <CreateProjectModal
        open={isModalOpen}
        project={editing}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
