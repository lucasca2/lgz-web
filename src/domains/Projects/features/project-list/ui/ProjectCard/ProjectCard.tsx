"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/Button";
import { ChevronDownIcon, PencilIcon } from "@/shared/ui/icons";
import type { ProjectDTO } from "../../types";
import styles from "./ProjectCard.module.css";

type ProjectCardProps = {
  project: ProjectDTO;
  onEdit: (project: ProjectDTO) => void;
};

export function ProjectCard({ project, onEdit }: ProjectCardProps) {
  const t = useTranslations("Projects");
  const [open, setOpen] = useState(false);
  const bodyId = useId();

  function toggle() {
    setOpen((value) => !value);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggle();
    }
  }

  return (
    <div className={styles.card}>
      <div
        className={styles.header}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={toggle}
        onKeyDown={handleKeyDown}
      >
        <span className={styles.name}>{project.name}</span>

        <span className={styles.headerActions}>
          <Button
            variant="ghost"
            size="sm"
            onClick={(event) => {
              event.stopPropagation();
              onEdit(project);
            }}
          >
            <PencilIcon />
            {t("edit")}
          </Button>
          <ChevronDownIcon
            className={[styles.chevron, open && styles.chevronOpen]
              .filter(Boolean)
              .join(" ")}
          />
        </span>
      </div>

      {open ? (
        <div id={bodyId} className={styles.body}>
          {project.expectation ? (
            <p className={styles.descricao}>{project.expectation}</p>
          ) : (
            <p className={styles.empty}>{t("emptyContext")}</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
