import type { ReactNode } from "react";
import styles from "./Sidebar.module.css";

type SidebarHeaderProps = {
  children: ReactNode;
};

// Região do topo da sidebar (normalmente a marca/logo).
export function SidebarHeader({ children }: SidebarHeaderProps) {
  return <div className={styles.header}>{children}</div>;
}
