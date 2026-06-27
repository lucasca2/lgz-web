import "server-only";

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/shared/lib/prisma";
import { projetoToProjectDTO } from "../projetoMapper";
import type { CreateProjectInput } from "../../schemas/projectSchemas";
import type { ProjectDTO } from "../../types";

// Retorna null quando o projeto não existe (o route handler vira isso em 404).
export async function updateProject(
  id: string,
  input: CreateProjectInput,
): Promise<ProjectDTO | null> {
  try {
    const row = await prisma.projetos.update({
      where: { id },
      data: {
        nome: input.name,
        contexto: input.expectation || null,
      },
      select: {
        id: true,
        nome: true,
        contexto: true,
        created_at: true,
      },
    });
    return projetoToProjectDTO(row);
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
