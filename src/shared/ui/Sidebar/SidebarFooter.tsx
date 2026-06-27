import type { ReactNode } from "react";
import styles from "./Sidebar.module.css";

type SidebarFooterProps = {
  children: ReactNode;
};

// Região do rodapé da sidebar (fixa embaixo via margin-top: auto).
export function SidebarFooter({ children }: SidebarFooterProps) {
  return <div className={styles.footer}>{children}</div>;
}
