import "server-only";

import { prisma } from "@/shared/lib/prisma";
import { posicaoToPositionDTO } from "../posicaoMapper";
import type { CreatePositionInput } from "../../schemas/positionSchemas";
import type { PositionDTO } from "../../types";

export async function createPosition(
  input: CreatePositionInput,
): Promise<PositionDTO> {
  const row = await prisma.posicoes.create({
    data: {
      nome: input.name,
      nivel: input.nivel,
      descricao: input.descricao,
    },
    select: {
      id: true,
      nome: true,
      nivel: true,
      descricao: true,
      created_at: true,
    },
  });
  return posicaoToPositionDTO(row);
}
