import type { ReactNode } from "react";
import styles from "./AuthCard.module.css";

type AuthCardProps = {
  title: string;
  subtitle?: string;
  error?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthCard({
  title,
  subtitle,
  error,
  children,
  footer,
}: AuthCardProps) {
  return (
    <div className={styles.card}>
      <header className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      </header>

      {error ? (
        <div className={styles.banner} role="alert">
          {error}
        </div>
      ) : null}

      <div className={styles.form}>{children}</div>

      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </div>
  );
}
