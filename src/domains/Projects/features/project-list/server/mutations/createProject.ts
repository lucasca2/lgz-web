import "server-only";

import { prisma } from "@/shared/lib/prisma";
import { projetoToProjectDTO } from "../projetoMapper";
import type { CreateProjectInput } from "../../schemas/projectSchemas";
import type { ProjectDTO } from "../../types";

export async function createProject(
  input: CreateProjectInput,
): Promise<ProjectDTO> {
  const row = await prisma.projetos.create({
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
}
