"use client";

import { useId, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/Button";
import { ChevronDownIcon, PencilIcon } from "@/shared/ui/icons";
import type { Nivel } from "../../constants/niveis";
import type { PositionDTO } from "../../types";
import { parseDescricao } from "../../utils";
import styles from "./PositionLevelRow.module.css";

// Liga/desliga o tint de fundo no item aberto. Default: só borda de acento.
const EXPANDED_TINT = false;

const levelClass: Record<Nivel, string> = {
  Junior: styles.levelJunior,
  Pleno: styles.levelPleno,
  Senior: styles.levelSenior,
  Especialista: styles.levelEspecialista,
};

type PositionLevelRowProps = {
  position: PositionDTO;
  expanded: boolean;
  onToggle: () => void;
  onEdit: (position: PositionDTO) => void;
};

export function PositionLevelRow({
  position,
  expanded,
  onToggle,
  onEdit,
}: PositionLevelRowProps) {
  const t = useTranslations("Positions");
  const bodyId = useId();

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onToggle();
    }
  }

  const rowClassName = [
    styles.row,
    expanded && styles.rowExpanded,
    expanded && EXPANDED_TINT && styles.rowTint,
  ]
    .filter(Boolean)
    .join(" ");

  const sections = expanded ? parseDescricao(position.descricao) : [];

  return (
    <div className={rowClassName}>
      <div
        className={styles.header}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-controls={bodyId}
        onClick={onToggle}
        onKeyDown={handleKeyDown}
      >
        <span className={[styles.level, levelClass[position.nivel]].join(" ")}>
          {t(`levels.${position.nivel}`)}
        </span>

        <span className={styles.actions}>
          <Button
            variant="ghost"
            size="sm"
            aria-label={expanded ? undefined : t("edit")}
            onClick={(event) => {
              event.stopPropagation();
              onEdit(position);
            }}
          >
            <PencilIcon />
            {expanded ? t("edit") : null}
          </Button>
          <ChevronDownIcon
            className={[styles.chevron, expanded && styles.chevronOpen]
              .filter(Boolean)
              .join(" ")}
          />
        </span>
      </div>

      {expanded ? (
        <div id={bodyId} className={styles.body}>
          {sections.map((section, index) => (
            <section key={index} className={styles.section}>
              {section.label ? (
                <h4 className={styles.sectionTitle}>{section.label}</h4>
              ) : null}
              {section.text ? (
                <p className={styles.sectionText}>{section.text}</p>
              ) : null}
              {section.bullets.length > 0 ? (
                <ul className={styles.sectionList}>
                  {section.bullets.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
      ) : null}
    </div>
  );
}
