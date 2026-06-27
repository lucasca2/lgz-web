"use client";

import { useLocale } from "next-intl";
import type { ProjectDTO } from "../../types";
import styles from "./ProjectCard.module.css";

type ProjectCardProps = {
  project: ProjectDTO;
};

export function ProjectCard({ project }: ProjectCardProps) {
  const locale = useLocale();
  const createdAt = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(project.createdAt));

  return (
    <tr className={styles.row}>
      <td className={styles.nameCell}>{project.name}</td>
      <td className={styles.expectationCell}>{project.expectation}</td>
      <td className={styles.dateCell}>{createdAt}</td>
    </tr>
  );
}
