import "server-only";

import { prisma } from "@/shared/lib/prisma";
import { projetoToProjectDTO } from "../projetoMapper";
import type { ProjectDTO } from "../../types";

// Server-only: leitura via Prisma (tabela `projetos`). Mapeia p/ ProjectDTO.
export async function getProjects(): Promise<ProjectDTO[]> {
  const rows = await prisma.projetos.findMany({
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      nome: true,
      contexto: true,
      created_at: true,
    },
  });
  return rows.map(projetoToProjectDTO);
}
