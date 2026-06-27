import type { ReactNode } from "react";
import styles from "./Badge.module.css";

export type BadgeVariant = "neutral" | "positive" | "negative" | "warn";

type BadgeProps = {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
};

// Pílula de status reutilizável, estilizada com os tokens do sistema.
export function Badge({ variant = "neutral", children, className }: BadgeProps) {
  return (
    <span
      className={[styles.badge, styles[variant], className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}
