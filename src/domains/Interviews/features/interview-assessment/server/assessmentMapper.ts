import "server-only";

import type {
  AnalysisJson,
  AssessmentDTO,
  AssessmentListItem,
  Decision,
  RecommendationJson,
} from "../types";

type PosicaoRel = { nome: string; nivel: string } | null | undefined;

type AssessmentRow = {
  id: string;
  posicao_id: string | null;
  candidato_nome: string;
  cargo: string | null;
  transcricao: string;
  analise_json: unknown;
  recomendacao_json: unknown;
  decisao: Decision | null;
  justificativa_manual: string | null;
  resumo_markdown: string | null;
  created_at: Date;
  updated_at: Date;
  posicoes?: PosicaoRel;
};

export function toAssessmentDTO(row: AssessmentRow): AssessmentDTO {
  return {
    id: row.id,
    posicaoId: row.posicao_id,
    posicaoNome: row.posicoes?.nome ?? null,
    posicaoNivel: row.posicoes?.nivel ?? null,
    candidateName: row.candidato_nome,
    cargo: row.cargo,
    transcricao: row.transcricao,
    analysis: (row.analise_json as AnalysisJson | null) ?? null,
    recommendation: (row.recomendacao_json as RecommendationJson | null) ?? null,
    decision: row.decisao,
    manualJustification: row.justificativa_manual,
    summaryMarkdown: row.resumo_markdown,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

// Linha enxuta usada na listagem (só os campos necessários para o item).
type ListRow = {
  id: string;
  candidato_nome: string;
  cargo: string | null;
  decisao: Decision | null;
  analise_json: unknown;
  recomendacao_json: unknown;
  transcricao: string;
  created_at: Date;
  posicoes?: PosicaoRel;
};

// Item de lista: não trafega transcrição/JSONs completos, apenas flags + contagem.
export function toListItem(row: ListRow): AssessmentListItem {
  return {
    id: row.id,
    candidateName: row.candidato_nome,
    cargo: row.cargo,
    posicaoNome: row.posicoes?.nome ?? null,
    posicaoNivel: row.posicoes?.nivel ?? null,
    decision: row.decisao,
    hasAnalysis: row.analise_json != null,
    hasRecommendation: row.recomendacao_json != null,
    transcriptChars: row.transcricao.length,
    createdAt: row.created_at.toISOString(),
  };
}
