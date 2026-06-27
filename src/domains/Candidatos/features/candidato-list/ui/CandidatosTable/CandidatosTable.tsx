"use client";

import { useTranslations } from "next-intl";
import type { CandidatoListItem } from "../../types";
import styles from "./CandidatosTable.module.css";

const badgeClass: Record<string, string> = {
  Hunting: styles.badgeHunting,
  Gupy: styles.badgeGupy,
  Indicacao: styles.badgeIndicacao,
  LinkedIn: styles.badgeLinkedIn,
  Outro: styles.badgeOutro,
};

const origemLabel: Record<string, string> = {
  Indicacao: "Indicação",
};

type Props = {
  candidatos: CandidatoListItem[];
  loading?: boolean;
};

export function CandidatosTable({ candidatos, loading }: Props) {
  const t = useTranslations("Candidatos");

  if (!loading && candidatos.length === 0) {
    return <p className={styles.empty}>{t("empty")}</p>;
  }

  return (
    <div className={`${styles.wrapper} ${loading ? styles.loading : ""}`}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>{t("table.nome")}</th>
            <th className={styles.th}>{t("table.email")}</th>
            <th className={styles.th}>{t("table.telefone")}</th>
            <th className={styles.th}>{t("table.origem")}</th>
            <th className={styles.th}>{t("table.pretensao")}</th>
            <th className={styles.th}>{t("table.dataCadastro")}</th>
          </tr>
        </thead>
        <tbody>
          {candidatos.map((c) => (
            <tr key={c.id} className={styles.row}>
              <td className={`${styles.td} ${styles.nome}`}>{c.nome}</td>
              <td className={styles.td}>{c.email ?? "—"}</td>
              <td className={styles.td}>{c.telefone ?? "—"}</td>
              <td className={styles.td}>
                {c.origem ? (
                  <span className={`${styles.badge} ${badgeClass[c.origem] ?? ""}`}>
                    {origemLabel[c.origem] ?? c.origem}
                  </span>
                ) : (
                  "—"
                )}
              </td>
              <td className={styles.td}>
                {c.pretensao_salarial
                  ? new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                      maximumFractionDigits: 0,
                    }).format(Number(c.pretensao_salarial))
                  : "—"}
              </td>
              <td className={styles.td}>
                {new Date(c.created_at).toLocaleDateString("pt-BR")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
