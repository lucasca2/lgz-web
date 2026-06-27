import type { ReactNode } from "react";
import { WaveLogo } from "@/shared/ui/WaveLogo";
import { LogoutButton } from "@/domains/Auth/shared/ui/LogoutButton";
import styles from "./layout.module.css";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <WaveLogo className={styles.logo} />
        <div className={styles.sidebarFooter}>
          <LogoutButton />
        </div>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
