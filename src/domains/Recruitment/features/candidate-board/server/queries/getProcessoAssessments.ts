import "server-only";

import { prisma } from "@/shared/lib/prisma";
import type {
  Decision,
  RecommendationJson,
} from "@/domains/Interviews/features/interview-assessment/types";

export type ProcessoAssessment = {
  id: string;
  decisao: Decision | null;
  confianca: number | null;
  justificativa: string | null;
  createdAt: string;
};

// Avaliações de entrevista vinculadas a um processo (mais recentes primeiro).
export async function getProcessoAssessments(
  processoId: string,
): Promise<ProcessoAssessment[]> {
  const rows = await prisma.avaliacoes_entrevista.findMany({
    where: { processo_id: processoId },
    orderBy: { created_at: "desc" },
    select: { id: true, decisao: true, recomendacao_json: true, created_at: true },
  });

  return rows.map((row) => {
    const rec = row.recomendacao_json as RecommendationJson | null;
    return {
      id: row.id,
      decisao: row.decisao,
      confianca: rec?.confianca ?? null,
      justificativa: rec?.justificativa ?? null,
      createdAt: row.created_at.toISOString(),
    };
  });
}
