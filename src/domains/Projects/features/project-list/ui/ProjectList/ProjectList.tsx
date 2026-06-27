"use client";

import { useTranslations } from "next-intl";
import { useProjects } from "../../hooks";
import { ProjectCard } from "../ProjectCard";
import type { ProjectDTO } from "../../types";
import styles from "./ProjectList.module.css";

type ProjectListProps = {
  onEdit: (project: ProjectDTO) => void;
};

export function ProjectList({ onEdit }: ProjectListProps) {
  const t = useTranslations("Projects");
  const { data: projects, isPending, isError } = useProjects();

  if (isPending) {
    return <p className={styles.state}>{t("loading")}</p>;
  }

  if (isError) {
    return <p className={styles.stateError}>{t("loadError")}</p>;
  }

  if (projects.length === 0) {
    return <p className={styles.state}>{t("empty")}</p>;
  }

  return (
    <div className={styles.list}>
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} onEdit={onEdit} />
      ))}
    </div>
  );
}
