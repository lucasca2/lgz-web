import type { ReactNode } from "react";
import styles from "./Sidebar.module.css";

type SidebarNavProps = {
  children: ReactNode;
  "aria-label"?: string;
};

// Lista de itens de navegação. Envolve SidebarNavItem.
export function SidebarNav({ children, "aria-label": ariaLabel }: SidebarNavProps) {
  return (
    <nav aria-label={ariaLabel}>
      <ul className={styles.nav}>{children}</ul>
    </nav>
  );
}
