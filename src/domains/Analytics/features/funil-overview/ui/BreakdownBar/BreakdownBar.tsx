import styles from "./BreakdownBar.module.css";

type BreakdownItem = {
  label: string;
  count: number;
  color: string;
};

type BreakdownBarProps = {
  items: BreakdownItem[];
};

export function BreakdownBar({ items }: BreakdownBarProps) {
  const total = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className={styles.wrapper}>
      <div className={styles.bar}>
        {items.map((item) => (
          <div
            key={item.label}
            className={styles.segment}
            style={{ flex: item.count, backgroundColor: item.color }}
            title={`${item.label}: ${item.count}`}
          />
        ))}
      </div>
      <div className={styles.legend}>
        {items.map((item) => {
          const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
          return (
            <div key={item.label} className={styles.legendItem}>
              <span
                className={styles.dot}
                style={{ backgroundColor: item.color }}
              />
              <span className={styles.legendLabel}>{item.label}</span>
              <span className={styles.legendCount}>{item.count}</span>
              <span className={styles.legendPct}>{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
