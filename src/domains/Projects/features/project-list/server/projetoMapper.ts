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

export function projetoToProjectDTO(row: ProjetoRow): ProjectDTO {
  return {
    id: row.id,
    name: row.nome,
    expectation: row.contexto ?? "",
    createdAt: row.created_at.toISOString(),
  };
}
