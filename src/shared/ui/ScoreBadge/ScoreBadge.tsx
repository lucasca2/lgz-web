import styles from "./ScoreBadge.module.css";

type ScoreBadgeProps = {
  /** Score de fit (0–100). `null` => ainda não avaliado pela IA. */
  score: number | null;
  /** Rótulo exibido quando `score` é null (ex.: "Pendente"). */
  pendingLabel: string;
  size?: "sm" | "md";
};

// Faixa de cor do score: alto = sucesso, médio = aviso, baixo = perigo.
function toneFor(score: number): "high" | "mid" | "low" {
  if (score >= 80) return "high";
  if (score >= 50) return "mid";
  return "low";
}

export function ScoreBadge({ score, pendingLabel, size = "md" }: ScoreBadgeProps) {
  if (score === null) {
    return (
      <span className={[styles.badge, styles.pending, styles[size]].join(" ")}>
        {pendingLabel}
      </span>
    );
  }

  const tone = toneFor(score);

  return (
    <span
      className={[styles.badge, styles[tone], styles[size]].join(" ")}
      title={`Score ${score}`}
    >
      {score}
    </span>
  );
}
