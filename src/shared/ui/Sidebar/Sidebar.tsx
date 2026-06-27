import type { ReactNode } from "react";
import styles from "./Sidebar.module.css";

type SidebarProps = {
  children: ReactNode;
};

// Painel lateral de navegação. Composição: SidebarHeader / SidebarContent / SidebarFooter.
export function Sidebar({ children }: SidebarProps) {
  return <aside className={styles.sidebar}>{children}</aside>;
}
