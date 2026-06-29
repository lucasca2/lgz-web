import "server-only";

import { prisma } from "@/shared/lib/prisma";
import { projetoToProjectDTO } from "../projetoMapper";
import type { ProjectDTO } from "../../types";

// Server-only: leitura via Prisma (tabela `projetos`). Mapeia p/ ProjectDTO,
// agregando a contagem de vagas (Aberta/Fechada) por nome do projeto — a
// relação projeto↔vaga é denormalizada via `vagas.projeto` (= `projetos.nome`).
export async function getProjects(): Promise<ProjectDTO[]> {
  const [rows, jobCounts] = await Promise.all([
    prisma.projetos.findMany({
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        nome: true,
        contexto: true,
        created_at: true,
      },
    }),
    prisma.vagas.groupBy({
      by: ["projeto", "status"],
      _count: { _all: true },
    }),
  ]);

  // nome do projeto -> { open, closed }
  const countsByProject = new Map<string, { open: number; closed: number }>();
  for (const { projeto, status, _count } of jobCounts) {
    const entry = countsByProject.get(projeto) ?? { open: 0, closed: 0 };
    if (status === "Aberta") entry.open += _count._all;
    else if (status === "Fechada") entry.closed += _count._all;
    countsByProject.set(projeto, entry);
  }

  return rows.map((row) =>
    projetoToProjectDTO(row, countsByProject.get(row.nome)),
  );
}
