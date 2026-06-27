"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRouter } from "next/navigation";
import type { BoardCardDTO } from "../../types";
import styles from "./CandidateCard.module.css";

type CandidateCardProps = { card: BoardCardDTO };

// Apresentacional — usado dentro do <DragOverlay> (cópia "fantasma" que segue o cursor).
export function CandidateCardView({
  card,
  dragging = false,
  overlay = false,
}: CandidateCardProps & { dragging?: boolean; overlay?: boolean }) {
  const className = [
    styles.card,
    dragging && styles.dragging,
    overlay && styles.overlay,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={className}>
      <p className={styles.name}>{card.candidateName}</p>
      <p className={styles.role}>
        {card.project} - {card.position}
      </p>
    </article>
  );
}

// Ordenável — usado dentro das colunas (arrasta entre colunas e reordena na mesma).
export function CandidateCard({ card }: CandidateCardProps) {
  const router = useRouter();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  // Clicar no card (sem arrastar) abre o fluxo de agendamento para o candidato.
  // O PointerSensor só inicia o drag após mover 5px, então um clique limpo não
  // dispara arraste e o onClick segue válido.
  function handleClick() {
    if (isDragging) return;
    router.push(
      `/agendar?candidate=${encodeURIComponent(card.candidateName)}`,
    );
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
