// ── Saídas da IA (mantêm as chaves em português vindas do modelo) ──

export type Intensidade = "alta" | "media" | "baixa";

export type AspectoGeral = {
  aspecto: string;
  evidencia: string;
  intensidade: Intensidade;
};

export type AspectoNegativo = {
  aspecto: string;
  evidencia: string;
  severidade: Intensidade;
};

export type AnalysisJson = {
  nome_candidato: string;
  cargo_pretendido: string;
  resumo_perfil: string;
  aspectos_comportamentais_gerais: AspectoGeral[];
  aspectos_comportamentais_negativos: AspectoNegativo[];
};

export type SimilarCandidate = { nome: string; similaridades: string };

export type Decision = "APROVAR" | "REPROVAR";

export type RecommendationJson = {
  recomendacao: Decision;
  confianca: number;
  justificativa: string;
  pontos_fortes: string[];
  pontos_de_atencao: string[];
  candidatos_similares_aprovados: SimilarCandidate[];
  candidatos_similares_reprovados: SimilarCandidate[];
};

// ── DTOs trafegados via HTTP (datas como string ISO) ──

export type AssessmentDTO = {
  id: string;
  posicaoId: string | null;
  posicaoNome: string | null;
  posicaoNivel: string | null;
  candidateName: string;
  cargo: string | null;
  transcricao: string;
  analysis: AnalysisJson | null;
  recommendation: RecommendationJson | null;
  decision: Decision | null;
  manualJustification: string | null;
  summaryMarkdown: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AssessmentListItem = {
  id: string;
  candidateName: string;
  cargo: string | null;
  posicaoNome: string | null;
  posicaoNivel: string | null;
  decision: Decision | null;
  hasAnalysis: boolean;
  hasRecommendation: boolean;
  transcriptChars: number;
  createdAt: string;
};

export type AssessmentStatusFilter =
  | "all"
  | "approved"
  | "rejected"
  | "pending"
  | "draft";

export type AssessmentListResponse = {
  items: AssessmentListItem[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

export type AiSettingsDTO = {
  model: string;
  analysisPrompt: string;
  recommendationPrompt: string;
  summaryPrompt: string;
  rejectionTemplatePrompt: string;
};

export type AiModelOption = { id: string; label: string };

export type AiSettingsResponse = {
  settings: AiSettingsDTO;
  defaults: AiSettingsDTO;
  availableModels: AiModelOption[];
};

export type RejectionTemplateResponse = { justificativa: string };
