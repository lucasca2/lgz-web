export type OrigenCandidato =
  | "Hunting"
  | "Gupy"
  | "Indicacao"
  | "LinkedIn"
  | "Outro";

export type CandidatoListItem = {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  origem: OrigenCandidato | null;
  pretensao_salarial: string | null;
  created_at: string;
};

export type CandidatosResponse = {
  data: CandidatoListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type CandidatoFilters = {
  q?: string;
  origem?: OrigenCandidato;
  page: number;
  pageSize: number;
};
