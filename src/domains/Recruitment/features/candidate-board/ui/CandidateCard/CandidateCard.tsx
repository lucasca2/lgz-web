"use client";

import type { CSSProperties } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTranslations } from "next-intl";
import { ScoreBadge } from "@/shared/ui/ScoreBadge";
import { STAGE_ACCENT } from "../../constants/stages";
import type { BoardCardDTO } from "../../types";
import { initials } from "../../utils";
import styles from "./CandidateCard.module.css";

type CandidateCardProps = { card: BoardCardDTO };

// Apresentacional — usado dentro do <DragOverlay> (cópia "fantasma" que segue o cursor).
export function CandidateCardView({
  card,
  dragging = false,
  overlay = false,
}: CandidateCardProps & { dragging?: boolean; overlay?: boolean }) {
  const t = useTranslations("Dashboard");
  const className = [
    styles.card,
    dragging && styles.dragging,
    overlay && styles.overlay,
  ]
    .filter(Boolean)
    .join(" ");

  const accentStyle = { "--stage-accent": STAGE_ACCENT[card.stage] } as CSSProperties;

  return (
    <article className={className} style={accentStyle}>
      <span className={styles.avatar} aria-hidden="true">
        {initials(card.candidateName)}
      </span>
      <div className={styles.text}>
        <p className={styles.name}>{card.candidateName}</p>
        <p className={styles.role}>
          {card.project} · {card.position}
        </p>
        {card.interview ? (
          <p className={styles.interview}>{t("hasInterview")}</p>
        ) : null}
      </div>
      <ScoreBadge
        score={card.score}
        pendingLabel={t("scorePending")}
        size="sm"
      />
    </article>
  );
}

// Ordenável — usado dentro das colunas (arrasta entre colunas e reordena na mesma).
export function CandidateCard({
  card,
  onSelect,
}: CandidateCardProps & { onSelect: (card: BoardCardDTO) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  // Clicar no card (sem arrastar) abre o modal do candidato. O PointerSensor só
  // inicia o drag após mover 5px, então um clique limpo não dispara arraste.
  function handleClick() {
    if (isDragging) return;
    onSelect(card);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={styles.handle}
      onClick={handleClick}
      {...listeners}
      {...attributes}
    >
      <CandidateCardView card={card} dragging={isDragging} />
    </div>
  );
}
