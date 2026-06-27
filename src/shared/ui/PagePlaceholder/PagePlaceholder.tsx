import styles from "./PagePlaceholder.module.css";

type PagePlaceholderProps = {
  title: string;
  subtitle?: string;
};

// Conteúdo provisório de uma tela ainda não implementada.
export function PagePlaceholder({ title, subtitle }: PagePlaceholderProps) {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{title}</h1>
      {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
    </div>
  );
}
