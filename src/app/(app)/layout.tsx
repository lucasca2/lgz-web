import type { ReactNode } from "react";
import { AppSidebar } from "@/shared/ui/AppSidebar";
import styles from "./layout.module.css";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <AppSidebar />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
