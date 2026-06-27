"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { CheckIcon, ChevronDownIcon } from "@/shared/ui/icons";
import { JOB_STATUSES, type JobStatus } from "../../schemas/jobSchemas";
import styles from "./JobStatusMenu.module.css";

const statusClass: Record<JobStatus, string> = {
  Aberta: styles.statusOpen,
  Fechada: styles.statusClosed,
  "Stand-by": styles.statusStandby,
  Cancelada: styles.statusCanceled,
};

const dotClass: Record<JobStatus, string> = {
  Aberta: styles.dotOpen,
  Fechada: styles.dotClosed,
  "Stand-by": styles.dotStandby,
  Cancelada: styles.dotCanceled,
};

type JobStatusMenuProps = {
  value: JobStatus;
  onChange: (status: JobStatus) => void;
  disabled?: boolean;
};

export function JobStatusMenu({ value, onChange, disabled }: JobStatusMenuProps) {
  const t = useTranslations("Jobs");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora ou apertar Esc.
  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function handleSelect(status: JobStatus) {
    setOpen(false);
    if (status !== value) onChange(status);
  }

  return (
    <div ref={rootRef} className={styles.root}>
      <button
        type="button"
        className={[styles.trigger, statusClass[value]].join(" ")}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("changeStatus")}
        disabled={disabled}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((prev) => !prev);
        }}
      >
        {t(`status.${value}`)}
        <ChevronDownIcon className={styles.chevron} />
      </button>

      {open ? (
        <div className={styles.menu} role="menu">
          {JOB_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              role="menuitemradio"
              aria-checked={status === value}
              className={styles.item}
              onClick={(event) => {
                event.stopPropagation();
                handleSelect(status);
              }}
            >
              <span className={[styles.dot, dotClass[status]].join(" ")} />
              <span className={styles.itemLabel}>{t(`status.${status}`)}</span>
              {status === value ? (
                <CheckIcon className={styles.check} />
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
