import "server-only";

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/shared/lib/prisma";
import { posicaoToPositionDTO } from "../posicaoMapper";
import type { CreatePositionInput } from "../../schemas/positionSchemas";
import type { PositionDTO } from "../../types";

// Retorna null quando a posição não existe (o route handler vira isso em 404).
export async function updatePosition(
  id: string,
  input: CreatePositionInput,
): Promise<PositionDTO | null> {
  try {
    const row = await prisma.posicoes.update({
      where: { id },
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
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return null;
    }
    throw error;
  }
}
