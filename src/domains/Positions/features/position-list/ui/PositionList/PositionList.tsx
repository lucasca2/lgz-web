"use client";

import { useTranslations } from "next-intl";
import { usePositions } from "../../hooks";
import { PositionCard } from "../PositionCard";
import type { PositionDTO } from "../../types";
import styles from "./PositionList.module.css";

type PositionListProps = {
  onEdit: (position: PositionDTO) => void;
};

export function PositionList({ onEdit }: PositionListProps) {
  const t = useTranslations("Positions");
  const { data: positions, isPending, isError } = usePositions();

  if (isPending) {
    return <p className={styles.state}>{t("loading")}</p>;
  }

  if (isError) {
    return <p className={styles.stateError}>{t("loadError")}</p>;
  }

  if (positions.length === 0) {
    return <p className={styles.state}>{t("empty")}</p>;
  }

  return (
    <div className={styles.list}>
      {positions.map((position) => (
        <PositionCard key={position.id} position={position} onEdit={onEdit} />
      ))}
    </div>
  );
}
