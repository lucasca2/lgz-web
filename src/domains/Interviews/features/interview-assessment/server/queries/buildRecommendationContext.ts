import "server-only";

import { prisma } from "@/shared/lib/prisma";
import type { AnalysisJson, RecommendationJson } from "../../types";

type CurrentForContext = {
  id: string;
  candidatoNome: string;
  posicaoId: string | null;
  analysis: AnalysisJson;
};

type HistRow = {
  id: string;
  candidato_nome: string;
  cargo: string | null;
  decisao: "APROVAR" | "REPROVAR" | null;
  analise_json: unknown;
  recomendacao_json: unknown;
  resumo_markdown: string | null;
  created_at: Date;
  posicoes: { nome: string; nivel: string } | null;
};

const histSelect = {
  id: true,
  candidato_nome: true,
  cargo: true,
  decisao: true,
  analise_json: true,
  recomendacao_json: true,
  resumo_markdown: true,
  created_at: true,
  posicoes: { select: { nome: true, nivel: true } },
} as const;

function formatHistorical(row: HistRow): string {
  const analysis = row.analise_json as AnalysisJson | null;
  const rec = row.recomendacao_json as RecommendationJson | null;
  const posicao = row.posicoes
    ? `${row.posicoes.nome} · ${row.posicoes.nivel}`
    : (row.cargo ?? "—");
  const data = row.created_at.toISOString().slice(0, 10);

  const lines: string[] = [
    `### ${row.candidato_nome} — ${row.decisao ?? "sem decisão"} (${posicao}, ${data})`,
  ];
  if (analysis?.resumo_perfil) {
    lines.push(`Resumo do perfil: ${analysis.resumo_perfil}`);
  }
  if (rec) {
    lines.push(
      `Recomendação da IA: ${rec.recomendacao} (confiança ${rec.confianca}%).`,
    );
    if (rec.justificativa) lines.push(`Justificativa: ${rec.justificativa}`);
    if (rec.pontos_fortes?.length) {
      lines.push(`Pontos fortes: ${rec.pontos_fortes.join("; ")}`);
    }
    if (rec.pontos_de_atencao?.length) {
      lines.push(`Pontos de atenção: ${rec.pontos_de_atencao.join("; ")}`);
    }
  }
  return lines.join("\n");
}

// Monta a mensagem de usuário enviada ao prompt de recomendação:
// candidato atual + posição (especialidade) + histórico do MESMO candidato
// + últimas 5 avaliações da MESMA posição.
export async function buildRecommendationContext(
  current: CurrentForContext,
): Promise<string> {
  // 1) Posição em questão (especialidade)
  let positionBlock = "";
  if (current.posicaoId) {
    const pos = await prisma.posicoes.findUnique({
      where: { id: current.posicaoId },
      select: { nome: true, nivel: true, descricao: true },
    });
    if (pos) {
      positionBlock = `## Posição em questão\n${pos.nome} — ${pos.nivel}\n${pos.descricao}\n\n`;
    }
  }

  // 2) Entrevistas anteriores do MESMO candidato (com análise feita)
  const sameCandidateRows = (await prisma.avaliacoes_entrevista.findMany({
    where: {
      candidato_nome: { equals: current.candidatoNome, mode: "insensitive" },
      NOT: { id: current.id },
    },
    orderBy: { created_at: "desc" },
    take: 8,
    select: histSelect,
  })) as HistRow[];
  const sameCandidate = sameCandidateRows
    .filter((row) => row.analise_json != null)
    .slice(0, 5);

  // 3) Últimas 5 avaliações para a MESMA posição (com recomendação), sem repetir
  // os registros já trazidos no histórico do próprio candidato.
  let samePosition: HistRow[] = [];
  if (current.posicaoId) {
    const seen = new Set(sameCandidate.map((row) => row.id));
    const rows = (await prisma.avaliacoes_entrevista.findMany({
      where: { posicao_id: current.posicaoId, NOT: { id: current.id } },
      orderBy: { created_at: "desc" },
      take: 12,
      select: histSelect,
    })) as HistRow[];
    samePosition = rows
      .filter((row) => row.recomendacao_json != null && !seen.has(row.id))
      .slice(0, 5);
  }

  const sameCandidateBlock =
    sameCandidate.length > 0
      ? sameCandidate.map(formatHistorical).join("\n\n---\n\n")
      : "Nenhuma entrevista anterior registrada para este candidato.";

  const samePositionBlock =
    samePosition.length > 0
      ? samePosition.map(formatHistorical).join("\n\n---\n\n")
      : "Nenhuma avaliação anterior registrada para esta posição.";

  return [
    `## Candidato atual (análise comportamental)\n${JSON.stringify(current.analysis, null, 2)}`,
    positionBlock.trim(),
    `## Entrevistas anteriores do mesmo candidato\n${sameCandidateBlock}`,
    `## Últimas avaliações para a mesma posição\n${samePositionBlock}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}
