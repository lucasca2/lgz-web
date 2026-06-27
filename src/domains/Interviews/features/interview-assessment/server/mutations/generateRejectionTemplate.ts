import "server-only";

import { prisma } from "@/shared/lib/prisma";
import { runRejectionTemplate } from "../ai";
import { AssessmentNotFoundError, MissingAnalysisError } from "../errors";
import type { AnalysisJson, RecommendationJson } from "../../types";

// Gera a justificativa de reprovação (devolutiva). Não persiste — é só texto.
export async function generateRejectionTemplate(id: string): Promise<string> {
  const current = await prisma.avaliacoes_entrevista.findUnique({
    where: { id },
    select: { analise_json: true, recomendacao_json: true },
  });
  if (!current) throw new AssessmentNotFoundError();

  const analysis = current.analise_json as AnalysisJson | null;
  if (!analysis) throw new MissingAnalysisError();

  const recommendation =
    current.recomendacao_json as RecommendationJson | null;

  return runRejectionTemplate(analysis, recommendation);
}
