import type { VagaAberta } from "../../types";
import styles from "./VagasTable.module.css";

type VagasTableProps = {
  vagas: VagaAberta[];
  labels: {
    nome: string;
    projeto: string;
    status: string;
    candidatos: string;
    diasAberta: string;
  };
};

const PROJETO_BADGE_CLASS: Record<VagaAberta["projeto"], string> = {
  Tim: styles.badgeTim,
  Sabesp: styles.badgeSabesp,
  Algar: styles.badgeAlgar,
  Telcel: styles.badgeTelcel,
};

export function VagasTable({ vagas, labels }: VagasTableProps) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>{labels.nome}</th>
            <th className={styles.th}>{labels.projeto}</th>
            <th className={styles.th}>{labels.status}</th>
            <th className={styles.th}>{labels.candidatos}</th>
            <th className={styles.th}>{labels.diasAberta}</th>
          </tr>
        </thead>
        <tbody>
          {vagas.map((vaga) => (
            <tr key={vaga.id} className={styles.row}>
              <td className={`${styles.td} ${styles.titulo}`}>{vaga.titulo}</td>
              <td className={styles.td}>
                <span
                  className={`${styles.badge} ${PROJETO_BADGE_CLASS[vaga.projeto]}`}
                >
                  {vaga.projeto}
                </span>
              </td>
              <td className={styles.td}>
                <span
                  className={`${styles.statusBadge} ${
                    vaga.status === "Stand_by"
                      ? styles.statusStandby
                      : styles.statusAberta
                  }`}
                >
                  {vaga.status === "Stand_by" ? "Stand-by" : "Aberta"}
                </span>
              </td>
              <td className={styles.td}>{vaga.candidatos}</td>
              <td
                className={`${styles.td} ${
                  vaga.diasAberta > 30 ? styles.diasAlerta : ""
                }`}
              >
                {vaga.diasAberta}d
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
