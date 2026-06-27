import type { Origem } from "../schemas/candidatoSchemas";

// Status do processo seletivo (enum `processo_status` do banco).
export type ProcessoStatus =
  | "Em_andamento"
  | "Aprovado"
  | "Reprovado"
  | "Base_de_Talentos";

// DTO trafegado via HTTP — `id` é o id do processo seletivo (candidato na vaga).
// Datas chegam como string (JSON) ao cliente.
export type JobCandidateDTO = {
  id: string;
  candidatoId: string;
  nome: string;
  linkedinUrl: string;
  email: string | null;
  origem: Origem | null;
  score: number | null;
  status: ProcessoStatus;
  createdAt: string;
};
