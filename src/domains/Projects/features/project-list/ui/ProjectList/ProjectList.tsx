"use client";

import { useTranslations } from "next-intl";
import { useProjects } from "../../hooks";
import { ProjectCard } from "../ProjectCard";
import styles from "./ProjectList.module.css";

export function ProjectList() {
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
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>{t("fields.name")}</th>
            <th className={styles.th}>{t("fields.expectation")}</th>
            <th className={styles.th}>{t("createdAtLabel")}</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
