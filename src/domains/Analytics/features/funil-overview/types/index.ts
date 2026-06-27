export type EtapaFunil =
  | "Entrevista People"
  | "Entrevista Técnica"
  | "Teste Técnico"
  | "Cultural"
  | "Liderança"
  | "Proposta";

export type FunilEtapa = {
  etapa: EtapaFunil;
  candidatos: number;
  conversao: number; // % entering this stage vs previous (first stage = 100)
};

export type StatusBreakdown = {
  status: "Em_andamento" | "Aprovado" | "Reprovado" | "Base_de_Talentos";
  count: number;
};

export type OrigemBreakdown = {
  origem: "Hunting" | "Gupy" | "Indicacao" | "LinkedIn" | "Outro";
  count: number;
};

export type MotivoReprovacao = {
  motivo: string;
  count: number;
};

export type SlaEtapa = {
  etapa: EtapaFunil;
  mediaDias: number;
};

export type VagaAberta = {
  id: string;
  titulo: string;
  projeto: "Tim" | "Sabesp" | "Algar" | "Telcel";
  status: "Aberta" | "Stand_by";
  candidatos: number;
  diasAberta: number;
};

export type FunilMetrics = {
  kpis: {
    totalCandidatos: number;
    candidatosAtivos: number;
    taxaConversaoGeral: number;
    slaMedioDias: number;
    vagasAbertas: number;
  };
  etapasFunil: FunilEtapa[];
  statusBreakdown: StatusBreakdown[];
  origemBreakdown: OrigemBreakdown[];
  motivosReprovacao: MotivoReprovacao[];
  slaEtapas: SlaEtapa[];
  vagasAbertas: VagaAberta[];
};
