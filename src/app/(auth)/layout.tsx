import type { ReactNode } from "react";
import Image from "next/image";
import { WaveLogo } from "@/shared/ui/WaveLogo";
import { LocaleSwitcher } from "@/shared/ui/LocaleSwitcher";
import styles from "./layout.module.css";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      {/* Componente 1 — imagem edge-to-edge inclinada, atrás (sangra nos cantos) */}
      <div className={styles.imageBg}>
        <div className={styles.imageBgInner}>
          <Image
            src="/welcome-background.png"
            alt=""
            fill
            priority
            sizes="(max-width: 880px) 0px, 60vw"
            style={{ objectFit: "cover", objectPosition: "left center" }}
          />
        </div>
      </div>

      {/* Componente 2 — card coeso EM CIMA: imagem à esquerda (divisa diagonal) + form à direita */}
      <div className={styles.card}>
        <div className={styles.cardImage}>
          <div className={styles.cardImageInner}>
            <Image
              src="/welcome-background.png"
              alt=""
              fill
              priority
              quality={100}
              sizes="(max-width: 880px) 0px, 60vw"
              style={{ objectFit: "cover", objectPosition: "left center" }}
            />
          </div>
        </div>

        <main className={styles.formArea}>
          <div className={styles.formTopbar}>
            <WaveLogo className={styles.logo} />
            <LocaleSwitcher />
          </div>
          <div className={styles.formBody}>{children}</div>
        </main>
      </div>
    </div>
  );
}
