import "server-only";

import { prisma } from "@/shared/lib/prisma";
import type {
  FlowTransition,
  FunilMetrics,
  OrigemBreakdown,
  StatusBreakdown,
} from "../../types";

// Etapas do funil (não-terminais), na ordem do pipeline. Espelha o catálogo
// (etapas_catalogo) e a ordem do board (BOARD_STAGES) — terminais Aprovado/
// Recusado ficam de fora do funil em si.
const PROCESS_STAGES = [
  "Triagem",
  "Fit Cultural",
  "People",
  "Teste Técnico",
  "Entrevistas",
  "Proposta",
] as const;

const LAST_PROCESS_IDX = PROCESS_STAGES.length - 1;

const ORIGENS: OrigemBreakdown["origem"][] = [
  "Hunting",
  "Gupy",
  "Indicacao",
  "LinkedIn",
  "Outro",
];

const STATUSES: StatusBreakdown["status"][] = [
  "Em_andamento",
  "Aprovado",
  "Reprovado",
  "Base_de_Talentos",
];

const MS_PER_DAY = 86_400_000;

type EtapaRow = {
  nome: string;
  executada: boolean;
  durationDays: number | null; // só quando Executada + data_fim
};

type ProcessoView = {
  status: StatusBreakdown["status"];
  origem: OrigemBreakdown["origem"];
  etapas: EtapaRow[]; // ordenadas por data_inicio asc
  reachedIdx: number; // índice da etapa mais avançada alcançada (em PROCESS_STAGES)
};

// Tempo gasto numa etapa fechada (Executada), descontando pausas. null se aberta.
function stageDuration(
  status_etapa: string,
  data_inicio: Date,
  data_fim: Date | null,
): number | null {
  if (status_etapa !== "Executada" || !data_fim) return null;
  const gross = (data_fim.getTime() - data_inicio.getTime()) / MS_PER_DAY;
  return Math.max(0, gross);
}

export async function getFunilMetrics(
  projeto?: string | null,
): Promise<FunilMetrics> {
  const now = Date.now();

  const [processosRaw, vagasAbertasRaw] = await Promise.all([
    // Processos no escopo (candidatos não removidos), com origem e histórico.
    prisma.processos_seletivos.findMany({
      where: {
        candidatos: { deleted_at: null },
        ...(projeto ? { vagas: { projeto } } : {}),
      },
      select: {
        status_atual: true,
        candidatos: { select: { origem: true } },
        historico_etapas: {
          orderBy: { data_inicio: "asc" },
          select: {
            status_etapa: true,
            data_inicio: true,
            data_fim: true,
            tempo_pausado_seg: true,
            etapas_catalogo: { select: { nome: true } },
          },
        },
      },
    }),
    // Vagas abertas (Aberta/Stand_by) com contagem de processos.
    prisma.vagas.findMany({
      where: {
        status: { in: ["Aberta", "Stand_by"] },
        ...(projeto ? { projeto } : {}),
      },
      orderBy: { data_abertura: "asc" },
      select: {
        id: true,
        titulo: true,
        projeto: true,
        status: true,
        data_abertura: true,
        _count: { select: { processos_seletivos: true } },
      },
    }),
  ]);

  // ── Normaliza cada processo ──
  const processos: ProcessoView[] = processosRaw.map((p) => {
    const etapas: EtapaRow[] = p.historico_etapas.map((h) => ({
      nome: h.etapas_catalogo.nome,
      executada: h.status_etapa === "Executada",
      durationDays: stageDuration(h.status_etapa, h.data_inicio, h.data_fim),
    }));

    // Etapa mais avançada alcançada: maior índice de PROCESS_STAGES presente no
    // histórico (todo processo entrou pela Triagem → piso 0). Aprovado ⇒ chegou
    // ao fim do pipeline.
    let reachedIdx = 0;
    for (const e of etapas) {
      const idx = PROCESS_STAGES.indexOf(e.nome as (typeof PROCESS_STAGES)[number]);
      if (idx > reachedIdx) reachedIdx = idx;
    }
    if (p.status_atual === "Aprovado") reachedIdx = LAST_PROCESS_IDX;

    return {
      status: p.status_atual,
      origem: (p.candidatos.origem as OrigemBreakdown["origem"] | null) ?? "Outro",
      etapas,
      reachedIdx,
    };
  });

  const total = processos.length;

  // ── Funil cumulativo (alcançou a etapa i ou além) ──
  const reachCounts = PROCESS_STAGES.map(
    (_, i) => processos.filter((p) => p.reachedIdx >= i).length,
  );
  const etapasFunil = PROCESS_STAGES.map((etapa, i) => ({
    etapa,
    candidatos: reachCounts[i],
    conversao:
      i === 0
        ? 100
        : reachCounts[i - 1] > 0
          ? Math.round((reachCounts[i] / reachCounts[i - 1]) * 100)
          : 0,
  }));

  // ── Status ──
  const statusCounts = new Map<string, number>();
  for (const p of processos)
    statusCounts.set(p.status, (statusCounts.get(p.status) ?? 0) + 1);
  const statusBreakdown: StatusBreakdown[] = STATUSES.map((status) => ({
    status,
    count: statusCounts.get(status) ?? 0,
  })).filter((s) => s.count > 0);

  // ── Origem ──
  const origemCounts = new Map<string, number>();
  for (const p of processos)
    origemCounts.set(p.origem, (origemCounts.get(p.origem) ?? 0) + 1);
  const origemBreakdown: OrigemBreakdown[] = ORIGENS.map((origem) => ({
    origem,
    count: origemCounts.get(origem) ?? 0,
  }))
    .filter((o) => o.count > 0)
    .sort((a, b) => b.count - a.count);

  // ── SLA por etapa (médias de etapas Executadas com data_fim) ──
  const slaEtapas = PROCESS_STAGES.map((etapa) => {
    const durations: number[] = [];
    for (const p of processos) {
      for (const e of p.etapas) {
        if (e.nome === etapa && e.durationDays != null)
          durations.push(e.durationDays);
      }
    }
    const mediaDias =
      durations.length > 0
        ? Math.round(durations.reduce((s, d) => s + d, 0) / durations.length)
        : 0;
    return { etapa, mediaDias };
  });

  // SLA médio total: média (por processo) da soma das durações de etapas fechadas.
  const perProcessoTotals = processos
    .map((p) =>
      p.etapas.reduce((s, e) => s + (e.durationDays ?? 0), 0),
    )
    .filter((d) => d > 0);
  const slaMedioDias =
    perProcessoTotals.length > 0
      ? Math.round(
          perProcessoTotals.reduce((s, d) => s + d, 0) /
            perProcessoTotals.length,
        )
      : 0;

  // ── Transições (caminho real pelo histórico) ──
  const transicaoCounts = new Map<string, number>();
  for (const p of processos) {
    for (let i = 0; i + 1 < p.etapas.length; i++) {
      const from = p.etapas[i].nome;
      const to = p.etapas[i + 1].nome;
      if (from === to) continue;
      const key = `${from}|||${to}`;
      transicaoCounts.set(key, (transicaoCounts.get(key) ?? 0) + 1);
    }
  }
  const transicoes: FlowTransition[] = [...transicaoCounts.entries()].map(
    ([key, count]) => {
      const sep = key.indexOf("|||");
      return { from: key.slice(0, sep), to: key.slice(sep + 3), count };
    },
  );

  // ── KPIs ──
  const aprovados = statusCounts.get("Aprovado") ?? 0;
  const reprovados = statusCounts.get("Reprovado") ?? 0;
  const ativos = statusCounts.get("Em_andamento") ?? 0;
  const decididos = aprovados + reprovados;

  return {
    kpis: {
      totalCandidatos: total,
      candidatosAtivos: ativos,
      // Taxa de aprovação entre os decididos (Aprovado / (Aprovado+Reprovado)).
      taxaConversaoGeral:
        decididos > 0 ? Math.round((aprovados / decididos) * 1000) / 10 : 0,
      slaMedioDias,
      vagasAbertas: vagasAbertasRaw.length,
    },
    etapasFunil,
    statusBreakdown,
    origemBreakdown,
    // Motivos de reprovação: sem caminho de gravação de motivo_reprovacao_id
    // hoje (comentado até existir a lógica). Mantido vazio.
    motivosReprovacao: [],
    slaEtapas,
    vagasAbertas: vagasAbertasRaw.map((v) => {
      const abertura = v.data_abertura.getTime();
      return {
        id: v.id,
        titulo: v.titulo,
        projeto: v.projeto,
        status: v.status as "Aberta" | "Stand_by",
        candidatos: v._count.processos_seletivos,
        diasAberta: Math.max(0, Math.floor((now - abertura) / MS_PER_DAY)),
      };
    }),
    transicoes,
  };
}
