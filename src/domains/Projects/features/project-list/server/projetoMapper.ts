import "server-only";

import type { ProjectDTO } from "../types";

// No banco a coluna é `contexto` (nullable); no DTO/UI usamos `expectation`
// (string, "" quando vazio).
type ProjetoRow = {
  id: string;
  nome: string;
  contexto: string | null;
  created_at: Date;
};

// Contagem de vagas por status (open = Aberta, closed = Fechada). Default 0.
type JobCounts = { open: number; closed: number };

export function projetoToProjectDTO(
  row: ProjetoRow,
  jobCounts: JobCounts = { open: 0, closed: 0 },
): ProjectDTO {
  return {
    id: row.id,
    name: row.nome,
    expectation: row.contexto ?? "",
    createdAt: row.created_at.toISOString(),
    openJobsCount: jobCounts.open,
    closedJobsCount: jobCounts.closed,
  };
}
