"use client";

import { useTranslations } from "next-intl";
import { PositionLevelRow } from "../PositionLevelRow";
import type { PositionDTO } from "../../types";
import styles from "./PositionAreaGroup.module.css";

type PositionAreaGroupProps = {
  area: string;
  positions: PositionDTO[];
  expandedId: string | null;
  onToggle: (id: string) => void;
  onEdit: (position: PositionDTO) => void;
};

export function PositionAreaGroup({
  area,
  positions,
  expandedId,
  onToggle,
  onEdit,
}: PositionAreaGroupProps) {
  const t = useTranslations("Positions");

  return (
    <section className={styles.group}>
      <header className={styles.header}>
        <h2 className={styles.name}>{area}</h2>
        <span className={styles.count}>
          {t("levelCount", { count: positions.length })}
        </span>
      </header>

      <div className={styles.rows}>
        {positions.map((position) => (
          <PositionLevelRow
            key={position.id}
            position={position}
            expanded={expandedId === position.id}
            onToggle={() => onToggle(position.id)}
            onEdit={onEdit}
          />
        ))}
      </div>
    </section>
  );
}
