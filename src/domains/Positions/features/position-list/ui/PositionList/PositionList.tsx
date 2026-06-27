"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { usePositions } from "../../hooks";
import { NIVEIS } from "../../constants/niveis";
import { PositionAreaGroup } from "../PositionAreaGroup";
import type { PositionDTO } from "../../types";
import styles from "./PositionList.module.css";

type PositionListProps = {
  onEdit: (position: PositionDTO) => void;
};

type AreaGroup = {
  area: string;
  positions: PositionDTO[];
};

const nivelOrder = new Map(NIVEIS.map((nivel, index) => [nivel, index]));

// Agrupa por área (campo `name`), ordena áreas por nome e os níveis de cada
// área por senioridade (ordem de NIVEIS), não por data de criação.
function groupByArea(positions: PositionDTO[]): AreaGroup[] {
  const byArea = new Map<string, PositionDTO[]>();
  for (const position of positions) {
    const list = byArea.get(position.name);
    if (list) {
      list.push(position);
    } else {
      byArea.set(position.name, [position]);
    }
  }

  return [...byArea.entries()]
    .map(([area, items]) => ({
      area,
      positions: [...items].sort(
        (a, b) => (nivelOrder.get(a.nivel) ?? 0) - (nivelOrder.get(b.nivel) ?? 0),
      ),
    }))
    .sort((a, b) => a.area.localeCompare(b.area));
}

export function PositionList({ onEdit }: PositionListProps) {
  const t = useTranslations("Positions");
  const { data: positions, isPending, isError } = usePositions();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isPending) {
    return <p className={styles.state}>{t("loading")}</p>;
  }

  if (isError) {
    return <p className={styles.stateError}>{t("loadError")}</p>;
  }

  if (positions.length === 0) {
    return <p className={styles.state}>{t("empty")}</p>;
  }

  // Single-open: só uma linha aberta em toda a tela.
  function toggle(id: string) {
    setExpandedId((current) => (current === id ? null : id));
  }

  const groups = groupByArea(positions);

  return (
    <div className={styles.list}>
      {groups.map((group) => (
        <PositionAreaGroup
          key={group.area}
          area={group.area}
          positions={group.positions}
          expandedId={expandedId}
          onToggle={toggle}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
