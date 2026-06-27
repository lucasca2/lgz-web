import "server-only";

import { prisma } from "@/shared/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { runRecommendation } from "../ai";
import { buildRecommendationContext } from "../queries/buildRecommendationContext";
import { toAssessmentDTO } from "../assessmentMapper";
import { AssessmentNotFoundError, MissingAnalysisError } from "../errors";
import type { AnalysisJson, AssessmentDTO } from "../../types";

// Gera a recomendação cruzando o candidato atual com o histórico do próprio
// candidato e com as últimas avaliações da mesma posição.
export async function generateRecommendation(
  id: string,
): Promise<AssessmentDTO> {
  const current = await prisma.avaliacoes_entrevista.findUnique({
    where: { id },
    select: {
      id: true,
      candidato_nome: true,
      posicao_id: true,
      analise_json: true,
    },
  });
  if (!current) throw new AssessmentNotFoundError();

  const analysis = current.analise_json as AnalysisJson | null;
  if (!analysis) throw new MissingAnalysisError();

  const context = await buildRecommendationContext({
    id: current.id,
    candidatoNome: current.candidato_nome,
    posicaoId: current.posicao_id,
    analysis,
  });

  const recommendation = await runRecommendation(context);

  const row = await prisma.avaliacoes_entrevista.update({
    where: { id },
    data: {
      recomendacao_json: recommendation as unknown as Prisma.InputJsonValue,
      decisao: recommendation.recomendacao,
    },
    include: { posicoes: { select: { nome: true, nivel: true } } },
  });

  return toAssessmentDTO(row);
}
