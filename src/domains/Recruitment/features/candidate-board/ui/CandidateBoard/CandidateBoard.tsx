"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useTranslations } from "next-intl";
import { BOARD_STAGES, type BoardStage } from "../../constants/stages";
import { useBoardCards, useSaveBoardOrder } from "../../hooks";
import type { BoardCardDTO } from "../../types";
import { BoardColumn } from "../BoardColumn";
import { CandidateCardView } from "../CandidateCard";
import { CandidateModal } from "../CandidateModal";
import { JustificationModal } from "../JustificationModal";
import styles from "./CandidateBoard.module.css";

type DragInfo = { id: string; fromStage: BoardStage; snapshot: BoardCardDTO[] };
type PendingMove = {
  cardId: string;
  fromStage: BoardStage;
  toStage: BoardStage;
  next: BoardCardDTO[];
  snapshot: BoardCardDTO[];
};

function isStage(id: string): id is BoardStage {
  return (BOARD_STAGES as readonly string[]).includes(id);
}

function lastIndexOfStage(list: BoardCardDTO[], stage: BoardStage): number {
  for (let i = list.length - 1; i >= 0; i -= 1) {
    if (list[i].stage === stage) return i;
  }
  return -1;
}

type CandidateBoardProps = { vagaId?: string };

export function CandidateBoard({ vagaId }: CandidateBoardProps) {
  const t = useTranslations("Dashboard");
  const { data, isPending, isError } = useBoardCards(vagaId);
  const saveOrder = useSaveBoardOrder(vagaId);

  // Cópia de trabalho local: o drag manipula ela na hora e a mutation persiste no servidor.
  // Semeada uma vez a partir do servidor; depois o estado local é a fonte da verdade do board
  // (evita "piscar" pro estado antigo enquanto a atualização otimista propaga).
  const [items, setItems] = useState<BoardCardDTO[] | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  // Card aberto no modal de detalhes (null = fechado).
  const [selected, setSelected] = useState<BoardCardDTO | null>(null);
  // Origem do drag em andamento (para detectar troca de coluna + reverter).
  const [dragInfo, setDragInfo] = useState<DragInfo | null>(null);
  // Movimento aguardando justificativa antes de persistir (null = nenhum).
  const [pendingMove, setPendingMove] = useState<PendingMove | null>(null);

  // Semeia o board a partir do servidor e, quando ocioso (sem drag / move
  // pendente / salvamento em andamento), reconcilia os campos NÃO-posicionais
  // (nome, score, etc.) com o servidor — preservando a coluna (stage) e a ordem
  // locais. Assim, editar um candidato (ou vincular um novo) reflete no board
  // sem "piscar" pro estado antigo durante o drag.
  useEffect(() => {
    if (!data) return;
    if (activeId || pendingMove || saveOrder.isPending) return;
    setItems((prev) => {
      if (prev === null) return data;
      const byId = new Map(data.map((card) => [card.id, card]));
      const reconciled = prev
        .filter((card) => byId.has(card.id))
        .map((card) => ({ ...byId.get(card.id)!, stage: card.stage }));
      const seen = new Set(reconciled.map((card) => card.id));
      const added = data.filter((card) => !seen.has(card.id));
      return [...reconciled, ...added];
    });
  }, [data, activeId, pendingMove, saveOrder.isPending]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  if (isPending) return <p className={styles.state}>{t("loading")}</p>;
  if (isError) return <p className={styles.state}>{t("loadError")}</p>;

  const cards = items ?? data;
  const activeCard = activeId
    ? (cards.find((card) => card.id === activeId) ?? null)
    : null;

  function handleDragStart(event: DragStartEvent) {
    const id = String(event.active.id);
    setActiveId(id);
    const card = cards.find((c) => c.id === id);
    if (card) setDragInfo({ id, fromStage: card.stage, snapshot: cards });
  }

  // Move o card entre colunas em tempo real (reordenar na mesma coluna fica a cargo do SortableContext).
  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    const activeIdStr = String(active.id);
    const overId = String(over.id);
    if (activeIdStr === overId) return;

    setItems((prev) => {
      const list = prev ?? cards;
      const activeItem = list.find((card) => card.id === activeIdStr);
      if (!activeItem) return prev;

      const overItem = list.find((card) => card.id === overId);
      const overStage: BoardStage | null = overItem
        ? overItem.stage
        : isStage(overId)
          ? overId
          : null;
      if (!overStage || activeItem.stage === overStage) return prev;

      const without = list.filter((card) => card.id !== activeIdStr);
      const moved: BoardCardDTO = { ...activeItem, stage: overStage };

      if (overItem) {
        const overIndex = without.findIndex((card) => card.id === overId);
        without.splice(overIndex, 0, moved);
      } else {
        without.splice(lastIndexOfStage(without, overStage) + 1, 0, moved);
      }
      return without;
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    const activeIdStr = String(active.id);
    const list = items ?? cards;
    const activeItem = list.find((card) => card.id === activeIdStr);
    const info = dragInfo;
    setDragInfo(null);
    if (!activeItem) return;

    let next = list;
    if (over) {
      const overId = String(over.id);
      const overItem = list.find((card) => card.id === overId);
      // Reordena na mesma coluna (cross-column já foi aplicado no onDragOver).
      if (overItem && activeIdStr !== overId && activeItem.stage === overItem.stage) {
        const oldIndex = list.findIndex((card) => card.id === activeIdStr);
        const newIndex = list.findIndex((card) => card.id === overId);
        next = arrayMove(list, oldIndex, newIndex);
        setItems(next);
      }
    }

    const movedCard = next.find((card) => card.id === activeIdStr);
    // Trocou de coluna → exige justificativa antes de persistir (a mutation
    // só dispara quando o recrutador confirma no JustificationModal).
    if (info && movedCard && movedCard.stage !== info.fromStage) {
      setPendingMove({
        cardId: activeIdStr,
        fromStage: info.fromStage,
        toStage: movedCard.stage,
        next,
        snapshot: info.snapshot,
      });
      return;
    }
    // Reordenar dentro da mesma coluna é apenas visual (ordem não é persistida).
  }

  function confirmMove(justificativa: string) {
    if (!pendingMove) return;
    saveOrder.mutate(
      {
        cards: pendingMove.next,
        justifications: { [pendingMove.cardId]: justificativa },
      },
      { onSuccess: () => setPendingMove(null) },
    );
  }

  function cancelMove() {
    if (pendingMove) setItems(pendingMove.snapshot);
    saveOrder.reset();
    setPendingMove(null);
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className={styles.board}>
          {BOARD_STAGES.map((stage) => (
            <BoardColumn
              key={stage}
              stage={stage}
              cards={cards.filter((card) => card.stage === stage)}
              onSelect={setSelected}
            />
          ))}
        </div>
        <DragOverlay>
          {activeCard ? <CandidateCardView card={activeCard} overlay /> : null}
        </DragOverlay>
      </DndContext>

      <CandidateModal card={selected} onClose={() => setSelected(null)} />

      {pendingMove ? (
        <JustificationModal
          fromStage={pendingMove.fromStage}
          toStage={pendingMove.toStage}
          loading={saveOrder.isPending}
          error={saveOrder.isError}
          onConfirm={confirmMove}
          onCancel={cancelMove}
        />
      ) : null}
    </>
  );
}
