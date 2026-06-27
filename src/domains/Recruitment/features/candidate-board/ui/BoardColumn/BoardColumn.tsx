"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useTranslations } from "next-intl";
import type { BoardStage } from "../../constants/stages";
import type { BoardCardDTO } from "../../types";
import { CandidateCard } from "../CandidateCard";
import styles from "./BoardColumn.module.css";

type BoardColumnProps = {
  stage: BoardStage;
  cards: BoardCardDTO[];
};

export function BoardColumn({ stage, cards }: BoardColumnProps) {
  const t = useTranslations("Dashboard");
  // Droppable da coluna inteira — recebe o card quando a coluna está vazia.
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  const className = [
    styles.column,
    isOver && styles.over,
    stage === "Rejeição" && styles.rejection,
  ]
    .filter(Boolean)
    .join(" ");

  const label = t(`stages.${stage}`);

  return (
    <section ref={setNodeRef} className={className} aria-label={label}>
      <header className={styles.header}>
        <span className={styles.title}>{label}</span>
        <span className={styles.count}>{cards.length}</span>
      </header>
      <SortableContext
        items={cards.map((card) => card.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className={styles.list}>
          {cards.length === 0 ? (
            <p className={styles.empty}>{t("emptyColumn")}</p>
          ) : (
            cards.map((card) => <CandidateCard key={card.id} card={card} />)
          )}
        </div>
      </SortableContext>
    </section>
  );
}
