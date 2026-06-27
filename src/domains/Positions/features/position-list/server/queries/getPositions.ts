import "server-only";

import { prisma } from "@/shared/lib/prisma";
import { posicaoToPositionDTO } from "../posicaoMapper";
import type { PositionDTO } from "../../types";

// Server-only: leitura via Prisma (tabela `posicoes`). Mapeia p/ PositionDTO.
export async function getPositions(): Promise<PositionDTO[]> {
  const rows = await prisma.posicoes.findMany({
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      nome: true,
      nivel: true,
      descricao: true,
      created_at: true,
    },
  });
  return rows.map(posicaoToPositionDTO);
}
