"use client";

import { useTranslations } from "next-intl";
import { useFunilMetrics } from "../hooks";
import { KpiCard, FunilBar, BreakdownBar, VagasTable } from "../ui";
import styles from "./FunilScreen.module.css";

const STATUS_COLORS: Record<string, string> = {
  Em_andamento: "#0f62fe",
  Aprovado: "#34d399",
  Reprovado: "#f87171",
  Base_de_Talentos: "#a78bfa",
};

const ORIGEM_COLORS: Record<string, string> = {
  Hunting: "#fb923c",
  Gupy: "#a78bfa",
  Indicacao: "#34d399",
  LinkedIn: "#60a5fa",
  Outro: "#94a3b8",
};

export function FunilScreen() {
  const t = useTranslations("Funil");
  const { data, isFetching } = useFunilMetrics();

  if (!data) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>{t("title")}</h1>
        <div className={styles.loading} />
      </div>
    );
  }

  const { kpis, etapasFunil, statusBreakdown, origemBreakdown, motivosReprovacao, slaEtapas, vagasAbertas } =
    data;

  const statusItems = statusBreakdown.map((s) => ({
    label: t(`status.${s.status}`),
    count: s.count,
    color: STATUS_COLORS[s.status] ?? "#94a3b8",
  }));

  const origemItems = origemBreakdown.map((o) => ({
    label: o.origem === "Indicacao" ? t("origem.Indicacao") : o.origem,
    count: o.count,
    color: ORIGEM_COLORS[o.origem] ?? "#94a3b8",
  }));

  const totalReprovacoes = motivosReprovacao.reduce((s, m) => s + m.count, 0);

  return (
    <div className={`${styles.page} ${isFetching ? styles.fetching : ""}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t("title")}</h1>
        <p className={styles.subtitle}>{t("subtitle")}</p>
      </div>

      {/* KPI row */}
      <div className={styles.kpiRow}>
        <KpiCard
          label={t("kpis.totalCandidatos")}
          value={kpis.totalCandidatos}
          tooltip={t("kpis.tooltips.totalCandidatos")}
        />
        <KpiCard
          label={t("kpis.candidatosAtivos")}
          value={kpis.candidatosAtivos}
          tooltip={t("kpis.tooltips.candidatosAtivos")}
        />
        <KpiCard
          label={t("kpis.taxaConversao")}
          value={`${kpis.taxaConversaoGeral}%`}
          subtext={t("kpis.geral")}
          accent
          tooltip={t("kpis.tooltips.taxaConversao")}
        />
        <KpiCard
          label={t("kpis.slaMedio")}
          value={kpis.slaMedioDias}
          subtext={t("kpis.dias")}
          tooltip={t("kpis.tooltips.slaMedio")}
        />
        <KpiCard
          label={t("kpis.vagasAbertas")}
          value={kpis.vagasAbertas}
          tooltip={t("kpis.tooltips.vagasAbertas")}
        />
      </div>

      {/* Funnel + Status */}
      <div className={styles.twoCol}>
        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>{t("funil.title")}</h2>
          <FunilBar
            etapas={etapasFunil}
            labelCandidatos={t("funil.candidatos")}
            labelConversao={t("funil.conversao")}
          />
        </section>
        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>{t("status.title")}</h2>
          <BreakdownBar items={statusItems} />
        </section>
      </div>

      {/* Origin + Rejection reasons */}
      <div className={styles.twoCol}>
        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>{t("origem.title")}</h2>
          <BreakdownBar items={origemItems} />
        </section>
        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>{t("reprovacao.title")}</h2>
          <div className={styles.motivosList}>
            {motivosReprovacao.map((m) => {
              const pct =
                totalReprovacoes > 0
                  ? Math.round((m.count / totalReprovacoes) * 100)
                  : 0;
              return (
                <div key={m.motivo} className={styles.motivoRow}>
                  <div className={styles.motivoInfo}>
                    <span className={styles.motivoLabel}>{m.motivo}</span>
                    <span className={styles.motivoCount}>
                      {m.count} {t("reprovacao.casos")}
                    </span>
                  </div>
                  <div className={styles.motivoTrack}>
                    <div
                      className={styles.motivoBar}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* SLA per stage */}
      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>{t("sla.title")}</h2>
        <div className={styles.tableWrapper}>
          <table className={styles.slaTable}>
            <thead>
              <tr>
                <th className={styles.slaTh}>{t("funil.title")}</th>
                <th className={styles.slaTh}>{t("sla.mediaDias")}</th>
              </tr>
            </thead>
            <tbody>
              {slaEtapas.map((s) => (
                <tr key={s.etapa} className={styles.slaRow}>
                  <td className={styles.slaTd}>{s.etapa}</td>
                  <td className={styles.slaTd}>
                    <span className={styles.slaValue}>{s.mediaDias}d</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Open positions */}
      <section className={styles.cardFull}>
        <h2 className={styles.sectionTitle}>{t("vagas.title")}</h2>
        <VagasTable
          vagas={vagasAbertas}
          labels={{
            nome: t("vagas.nome"),
            projeto: t("vagas.projeto"),
            status: t("vagas.status"),
            candidatos: t("vagas.candidatos"),
            diasAberta: t("vagas.diasAberta"),
          }}
        />
      </section>
    </div>
  );
}
