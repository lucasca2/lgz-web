import "server-only";

import type { FunilMetrics } from "../../types";

// ─────────────────────────────────────────────────────────────────────────────
// Raw types (mirror Prisma models)
// ─────────────────────────────────────────────────────────────────────────────

const FUNNEL_STAGES = [
  "Entrevista People",
  "Entrevista Técnica",
  "Teste Técnico",
  "Liderança",
  "Proposta",
] as const;
type FunnelStage = (typeof FUNNEL_STAGES)[number];

type Origem = "Hunting" | "Gupy" | "Indicacao" | "LinkedIn" | "Outro";
type ProcessoStatus = "Em_andamento" | "Aprovado" | "Reprovado";
type EtapaStatus = "Executada" | "Pulada";

// historico_etapas row
type HistoricoEtapa = {
  nome: FunnelStage;
  status: EtapaStatus;
  dias: number; // data_fim - data_inicio in days (0 when Pulada or in progress)
};

// processos_seletivos + candidatos joined
type Processo = {
  id: string;
  vaga_id: string;
  origem: Origem;
  status_atual: ProcessoStatus;
  motivo_descricao?: string; // motivos_reprovacao.descricao
  etapas: HistoricoEtapa[];
};

// vagas row
type Vaga = {
  id: string;
  titulo: string;
  projeto: "Tim" | "Sabesp" | "Algar" | "Telcel";
  status: "Aberta" | "Stand_by";
  data_abertura: string; // YYYY-MM-DD
};

// ─────────────────────────────────────────────────────────────────────────────
// Mock data — vagas
// ─────────────────────────────────────────────────────────────────────────────

const VAGAS: Vaga[] = [
  { id: "v1",  titulo: "Engenheiro de Software Backend Sênior", projeto: "Tim",   status: "Aberta",   data_abertura: "2026-05-16" },
  { id: "v2",  titulo: "Analista de Dados Pleno",               projeto: "Sabesp", status: "Aberta",  data_abertura: "2026-05-30" },
  { id: "v3",  titulo: "Tech Lead Full Stack",                  projeto: "Tim",   status: "Stand_by", data_abertura: "2026-04-21" },
  { id: "v4",  titulo: "Product Manager",                       projeto: "Algar", status: "Aberta",   data_abertura: "2026-06-08" },
  { id: "v5",  titulo: "Engenheiro de Software Frontend Pleno", projeto: "Telcel", status: "Aberta",  data_abertura: "2026-05-23" },
  { id: "v6",  titulo: "DevOps Engineer",                       projeto: "Tim",   status: "Aberta",   data_abertura: "2026-05-07" },
  { id: "v7",  titulo: "Analista de QA Sênior",                 projeto: "Sabesp", status: "Aberta",  data_abertura: "2026-06-05" },
  { id: "v8",  titulo: "Staff Engineer",                        projeto: "Algar", status: "Stand_by", data_abertura: "2026-03-31" },
  { id: "v9",  titulo: "Engenheiro de Software Mobile Júnior",  projeto: "Telcel", status: "Aberta",  data_abertura: "2026-06-13" },
  { id: "v10", titulo: "Scrum Master",                          projeto: "Tim",   status: "Aberta",   data_abertura: "2026-05-28" },
  { id: "v11", titulo: "Data Engineer Pleno",                   projeto: "Sabesp", status: "Aberta",  data_abertura: "2026-06-02" },
  { id: "v12", titulo: "Engenheiro de Segurança",               projeto: "Algar", status: "Aberta",   data_abertura: "2026-05-12" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Mock data — processos (scenarios expanded into individual records)
// ─────────────────────────────────────────────────────────────────────────────

// Typical days a candidate spends in each stage (mediaDias source)
const STAGE_DIAS: Record<FunnelStage, number> = {
  "Entrevista People": 3,
  "Entrevista Técnica": 5,
  "Teste Técnico": 7,
  "Liderança": 6,
  "Proposta": 4,
};

function etapa(nome: FunnelStage, status: EtapaStatus = "Executada"): HistoricoEtapa {
  return { nome, status, dias: status === "Executada" ? STAGE_DIAS[nome] : 0 };
}

// Reusable stage paths (mirror common historico_etapas sequences)
const PATH = {
  people:    [etapa("Entrevista People")],
  tecnica:   [etapa("Entrevista People"), etapa("Entrevista Técnica")],
  teste:     [etapa("Entrevista People"), etapa("Entrevista Técnica"), etapa("Teste Técnico")],
  lideranca: [etapa("Entrevista People"), etapa("Entrevista Técnica"), etapa("Teste Técnico"), etapa("Liderança")],
  proposta:  [etapa("Entrevista People"), etapa("Entrevista Técnica"), etapa("Teste Técnico"), etapa("Liderança"), etapa("Proposta")],
};

type Scenario = Omit<Processo, "id">;

// [count, scenario] — totals: 115 Reprovado + 22 Aprovado + 47 Em_andamento = 184
const SCENARIOS: Array<[number, Scenario]> = [
  // ── Reprovados at People (60) ───────────────────────────────────────────────
  [40, { vaga_id: "v1",  origem: "Hunting",   status_atual: "Reprovado", motivo_descricao: "Perfil não aderente à vaga",              etapas: PATH.people }],
  [20, { vaga_id: "v2",  origem: "Gupy",      status_atual: "Reprovado", motivo_descricao: "Fit cultural insuficiente",                etapas: PATH.people }],
  // ── Reprovados at Técnica (30) ──────────────────────────────────────────────
  [18, { vaga_id: "v3",  origem: "LinkedIn",  status_atual: "Reprovado", motivo_descricao: "Habilidades técnicas abaixo do esperado",  etapas: PATH.tecnica }],
  [12, { vaga_id: "v4",  origem: "Outro",     status_atual: "Reprovado", motivo_descricao: "Habilidades técnicas abaixo do esperado",  etapas: PATH.tecnica }],
  // ── Reprovados at Teste (17) ────────────────────────────────────────────────
  [17, { vaga_id: "v5",  origem: "Gupy",      status_atual: "Reprovado", motivo_descricao: "Habilidades técnicas abaixo do esperado",  etapas: PATH.teste }],
  // ── Reprovados at Liderança (6) ─────────────────────────────────────────────
  [6,  { vaga_id: "v6",  origem: "Hunting",   status_atual: "Reprovado", motivo_descricao: "Expectativa salarial acima do budget",     etapas: PATH.lideranca }],
  // ── Reprovados at Proposta (2) ──────────────────────────────────────────────
  [2,  { vaga_id: "v7",  origem: "Indicacao", status_atual: "Reprovado", motivo_descricao: "Desistiu do processo",                    etapas: PATH.proposta }],
  // ── Aprovados (22) ──────────────────────────────────────────────────────────
  [22, { vaga_id: "v8",  origem: "Hunting",   status_atual: "Aprovado",  etapas: PATH.proposta }],
  // ── Em andamento at People (4) ──────────────────────────────────────────────
  [4,  { vaga_id: "v10", origem: "Gupy",      status_atual: "Em_andamento", etapas: PATH.people }],
  // ── Em andamento at Técnica (15) ────────────────────────────────────────────
  [15, { vaga_id: "v11", origem: "LinkedIn",  status_atual: "Em_andamento", etapas: PATH.tecnica }],
  // ── Em andamento at Teste (10) ──────────────────────────────────────────────
  [10, { vaga_id: "v12", origem: "Outro",     status_atual: "Em_andamento", etapas: PATH.teste }],
  // ── Em andamento at Liderança (15) ──────────────────────────────────────────
  [15, { vaga_id: "v1",  origem: "Hunting",   status_atual: "Em_andamento", etapas: PATH.lideranca }],
  // ── Em andamento at Proposta (3) ────────────────────────────────────────────
  [3,  { vaga_id: "v3",  origem: "Gupy",      status_atual: "Em_andamento", etapas: PATH.proposta }],
];

function buildProcessos(): Processo[] {
  const result: Processo[] = [];
  let pid = 1;
  for (const [count, scenario] of SCENARIOS) {
    for (let i = 0; i < count; i++) {
      result.push({ ...scenario, id: `p${pid++}` });
    }
  }
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Aggregation — each function mirrors a real Prisma query
// ─────────────────────────────────────────────────────────────────────────────

function computeEtapasFunil(processos: Processo[]) {
  return FUNNEL_STAGES.map((stage, i) => {
    const count = processos.filter((p) =>
      p.etapas.some((e) => e.nome === stage && e.status === "Executada"),
    ).length;
    const prevCount =
      i === 0
        ? processos.length
        : processos.filter((p) =>
            p.etapas.some((e) => e.nome === FUNNEL_STAGES[i - 1] && e.status === "Executada"),
          ).length;
    return {
      etapa: stage,
      candidatos: count,
      conversao: i === 0 ? 100 : Math.round((count / prevCount) * 100),
    };
  });
}

function computeStatusBreakdown(processos: Processo[]) {
  const counts: Record<ProcessoStatus, number> = { Em_andamento: 0, Aprovado: 0, Reprovado: 0 };
  for (const p of processos) counts[p.status_atual]++;
  return (Object.entries(counts) as [ProcessoStatus, number][]).map(([status, count]) => ({
    status,
    count,
  }));
}

function computeOrigemBreakdown(processos: Processo[]) {
  const counts = new Map<Origem, number>();
  for (const p of processos) counts.set(p.origem, (counts.get(p.origem) ?? 0) + 1);
  return [...counts.entries()]
    .sort(([, a], [, b]) => b - a)
    .map(([origem, count]) => ({ origem, count }));
}

function computeMotivosReprovacao(processos: Processo[]) {
  const counts = new Map<string, number>();
  for (const p of processos) {
    if (p.status_atual === "Reprovado" && p.motivo_descricao) {
      counts.set(p.motivo_descricao, (counts.get(p.motivo_descricao) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort(([, a], [, b]) => b - a)
    .map(([motivo, count]) => ({ motivo, count }));
}

function computeSlaEtapas(processos: Processo[]) {
  return FUNNEL_STAGES.map((stage) => {
    const dias = processos.flatMap((p) =>
      p.etapas
        .filter((e) => e.nome === stage && e.status === "Executada" && e.dias > 0)
        .map((e) => e.dias),
    );
    return {
      etapa: stage,
      mediaDias: dias.length > 0 ? Math.round(dias.reduce((s, d) => s + d, 0) / dias.length) : 0,
    };
  });
}

// Derives FlowTransition[] from historico_etapas sequences.
// Pulada stages are skipped; terminal outcome (Aprovado/Reprovado) added for finished processos.
function computeTransicoes(processos: Processo[]) {
  const counts = new Map<string, number>();
  const add = (from: string, to: string) => {
    const key = `${from}|||${to}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  };

  for (const p of processos) {
    const executed = p.etapas.filter((e) => e.status === "Executada");
    for (let i = 0; i + 1 < executed.length; i++) {
      add(executed[i].nome, executed[i + 1].nome);
    }
    if (p.status_atual !== "Em_andamento" && executed.length > 0) {
      add(executed[executed.length - 1].nome, p.status_atual);
    }
  }

  return [...counts.entries()].map(([key, count]) => {
    const sep = key.indexOf("|||");
    return { from: key.slice(0, sep), to: key.slice(sep + 3), count };
  });
}

function computeVagasAbertas(processos: Processo[], vagas: Vaga[], today: Date) {
  const countByVaga = new Map<string, number>();
  for (const p of processos) countByVaga.set(p.vaga_id, (countByVaga.get(p.vaga_id) ?? 0) + 1);

  return vagas.filter((v) => v.status === "Aberta" || v.status === "Stand_by").map((v) => {
    const abertura = new Date(v.data_abertura);
    const diasAberta = Math.round((today.getTime() - abertura.getTime()) / 86_400_000);
    return {
      id: v.id,
      titulo: v.titulo,
      projeto: v.projeto,
      status: v.status,
      candidatos: countByVaga.get(v.id) ?? 0,
      diasAberta,
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Exported query
// ─────────────────────────────────────────────────────────────────────────────

export async function getFunilMetrics(projeto?: string | null): Promise<FunilMetrics> {
  const today = new Date("2026-06-27");

  const vagasFiltradas = projeto ? VAGAS.filter((v) => v.projeto === projeto) : VAGAS;
  const vagasIds = new Set(vagasFiltradas.map((v) => v.id));
  const processos = buildProcessos().filter((p) => vagasIds.has(p.vaga_id));

  const slaEtapas = computeSlaEtapas(processos);

  const total = processos.length;
  const aprovados = processos.filter((p) => p.status_atual === "Aprovado").length;
  const ativos = processos.filter((p) => p.status_atual === "Em_andamento").length;

  // Average total process duration per candidato
  const slaMedioDias =
    total > 0
      ? Math.round(
          processos.reduce(
            (sum, p) =>
              sum + p.etapas.filter((e) => e.status === "Executada").reduce((s, e) => s + e.dias, 0),
            0,
          ) / total,
        )
      : 0;

  return {
    projetos: Array.from(new Set(VAGAS.map((v) => v.projeto))).sort(),
    kpis: {
      totalCandidatos: total,
      candidatosAtivos: ativos,
      taxaConversaoGeral: total > 0 ? Math.round((aprovados / total) * 1000) / 10 : 0,
      slaMedioDias,
      vagasAbertas: vagasFiltradas.filter((v) => v.status === "Aberta" || v.status === "Stand_by").length,
    },
    etapasFunil: computeEtapasFunil(processos),
    statusBreakdown: computeStatusBreakdown(processos),
    origemBreakdown: computeOrigemBreakdown(processos),
    motivosReprovacao: computeMotivosReprovacao(processos),
    slaEtapas,
    vagasAbertas: computeVagasAbertas(processos, vagasFiltradas, today),
    transicoes: computeTransicoes(processos),
  };
}
