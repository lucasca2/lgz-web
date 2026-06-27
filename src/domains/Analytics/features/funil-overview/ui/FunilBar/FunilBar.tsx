import type { FunilEtapa } from "../../types";
import styles from "./FunilBar.module.css";

type FunilBarProps = {
  etapas: FunilEtapa[];
  labelCandidatos: string;
  labelConversao: string;
};

export function FunilBar({ etapas, labelCandidatos, labelConversao }: FunilBarProps) {
  const max = etapas[0]?.candidatos ?? 1;

  return (
    <div className={styles.wrapper}>
      {etapas.map((etapa, index) => {
        const widthPct = (etapa.candidatos / max) * 100;
        const opacity = 1 - (index / etapas.length) * 0.5;

        return (
          <div key={etapa.etapa} className={styles.row}>
            {index > 0 && (
              <div className={styles.connector}>
                <span className={styles.conversionBadge}>
                  {etapa.conversao}% {labelConversao}
                </span>
              </div>
            )}
            <div className={styles.stageRow}>
              <span className={styles.stageLabel}>{etapa.etapa}</span>
              <div className={styles.barTrack}>
                <div
                  className={styles.bar}
                  style={{ width: `${widthPct}%`, opacity }}
                />
              </div>
              <span className={styles.count}>
                {etapa.candidatos} {labelCandidatos}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
