"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/Button";
import { ChevronDownIcon, PencilIcon } from "@/shared/ui/icons";
import type { Nivel } from "../../constants/niveis";
import type { PositionDTO } from "../../types";
import styles from "./PositionCard.module.css";

const levelClass: Record<Nivel, string> = {
  Junior: styles.levelJunior,
  Pleno: styles.levelPleno,
  Senior: styles.levelSenior,
  Especialista: styles.levelEspecialista,
};

type PositionCardProps = {
  position: PositionDTO;
  onEdit: (position: PositionDTO) => void;
};

export function PositionCard({ position, onEdit }: PositionCardProps) {
  const t = useTranslations("Positions");
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
        <span className={styles.heading}>
          <span className={styles.name}>{position.name}</span>
          <span className={[styles.level, levelClass[position.nivel]].join(" ")}>
            {t(`levels.${position.nivel}`)}
          </span>
        </span>

        <span className={styles.headerActions}>
          <Button
            variant="ghost"
            size="sm"
            onClick={(event) => {
              event.stopPropagation();
              onEdit(position);
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
          <p className={styles.descricao}>{position.descricao}</p>
        </div>
      ) : null}
    </div>
  );
}
