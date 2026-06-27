import styles from "./KpiCard.module.css";

type KpiCardProps = {
  label: string;
  value: string | number;
  subtext?: string;
  accent?: boolean;
  tooltip?: string;
};

export function KpiCard({ label, value, subtext, accent, tooltip }: KpiCardProps) {
  return (
    <article className={`${styles.card} ${accent ? styles.accent : ""}`}>
      <span className={styles.value}>{value}</span>
      <span className={styles.labelRow}>
        <span className={styles.label}>{label}</span>
        {tooltip && (
          <span className={styles.infoIcon} data-tooltip={tooltip} aria-label={tooltip}>
            ?
          </span>
        )}
      </span>
      {subtext && <span className={styles.subtext}>{subtext}</span>}
    </article>
  );
}
