import "server-only";

import type { Nivel } from "../constants/niveis";
import type { PositionDTO } from "../types";

// O enum do banco (`nivel_senioridade`) usa exatamente os mesmos valores do
// DTO/UI (Junior/Pleno/Senior/Especialista), então não há remapeamento.
type PosicaoRow = {
  id: string;
  nome: string;
  nivel: Nivel;
  descricao: string;
  created_at: Date;
};

export function posicaoToPositionDTO(row: PosicaoRow): PositionDTO {
  return {
    id: row.id,
    name: row.nome,
    nivel: row.nivel,
    descricao: row.descricao,
    createdAt: row.created_at.toISOString(),
  };
}
