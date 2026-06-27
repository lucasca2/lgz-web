"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/Button";
import { PlusIcon } from "@/shared/ui/icons";
import { PositionList } from "../../ui/PositionList";
import { CreatePositionModal } from "../../ui/CreatePositionModal";
import type { PositionDTO } from "../../types";
import styles from "./PositionListScreen.module.css";

export function PositionListScreen() {
  const t = useTranslations("Positions");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<PositionDTO | null>(null);

  function openCreate() {
    setEditing(null);
    setIsModalOpen(true);
  }

  function openEdit(position: PositionDTO) {
    setEditing(position);
    setIsModalOpen(true);
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{t("title")}</h1>
          <p className={styles.subtitle}>{t("subtitle")}</p>
        </div>
        <Button size="md" onClick={openCreate}>
          <PlusIcon />
          {t("create")}
        </Button>
      </header>

      <PositionList onEdit={openEdit} />

      <CreatePositionModal
        open={isModalOpen}
        position={editing}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
