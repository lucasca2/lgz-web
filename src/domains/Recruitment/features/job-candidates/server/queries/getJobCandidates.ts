import "server-only";

import { prisma } from "@/shared/lib/prisma";
import type { JobCandidateDTO, ProcessoStatus } from "../../types";
import type { Origem } from "../../schemas/candidatoSchemas";

// Server-only: lista os candidatos (processos seletivos) de uma vaga, com os
// dados do candidato. `score` vem de `score_fit_cultural` (null até a IA avaliar).
export async function getJobCandidates(
  vagaId: string,
): Promise<JobCandidateDTO[]> {
  const rows = await prisma.processos_seletivos.findMany({
    where: { vaga_id: vagaId, candidatos: { deleted_at: null } },
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      candidato_id: true,
      status_atual: true,
      score_fit_cultural: true,
      created_at: true,
      candidatos: {
        select: { nome: true, linkedin_url: true, email: true, origem: true },
      },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    candidatoId: row.candidato_id,
    nome: row.candidatos.nome,
    linkedinUrl: row.candidatos.linkedin_url,
    email: row.candidatos.email,
    origem: (row.candidatos.origem as Origem | null) ?? null,
    score: row.score_fit_cultural,
    status: row.status_atual as ProcessoStatus,
    createdAt: row.created_at.toISOString(),
  }));
}
