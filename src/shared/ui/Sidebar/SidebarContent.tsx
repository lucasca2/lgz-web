import type { ReactNode } from "react";
import styles from "./Sidebar.module.css";

type SidebarContentProps = {
  children: ReactNode;
};

// Região central rolável da sidebar (navegação primária). Cresce a partir do topo.
export function SidebarContent({ children }: SidebarContentProps) {
  return <div className={styles.content}>{children}</div>;
}
