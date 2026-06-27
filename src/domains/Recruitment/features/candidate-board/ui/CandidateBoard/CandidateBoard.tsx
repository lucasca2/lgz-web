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
import styles from "./CandidateBoard.module.css";

function isStage(id: string): id is BoardStage {
  return (BOARD_STAGES as readonly string[]).includes(id);
}

function lastIndexOfStage(list: BoardCardDTO[], stage: BoardStage): number {
  for (let i = list.length - 1; i >= 0; i -= 1) {
    if (list[i].stage === stage) return i;
  }
  return -1;
}

export function CandidateBoard() {
  const t = useTranslations("Dashboard");
  const { data, isPending, isError } = useBoardCards();
  const saveOrder = useSaveBoardOrder();

  // Cópia de trabalho local: o drag manipula ela na hora e a mutation persiste no servidor.
  // Semeada uma vez a partir do servidor; depois o estado local é a fonte da verdade do board
  // (evita "piscar" pro estado antigo enquanto a atualização otimista propaga).
  const [items, setItems] = useState<BoardCardDTO[] | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    setItems((prev) => (prev === null && data ? data : prev));
  }, [data]);

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
    setActiveId(String(event.active.id));
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

    // Persiste o arranjo final (a mutation otimista já reflete tudo na tela).
    saveOrder.mutate(next);
  }

  return (
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
          />
        ))}
      </div>
      <DragOverlay>
        {activeCard ? <CandidateCardView card={activeCard} overlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
