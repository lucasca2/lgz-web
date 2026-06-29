import "server-only";

import { prisma } from "@/shared/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { claudeMessageRaw, extractJson } from "@/shared/lib/anthropic";
import { getAiSettings } from "@/domains/Interviews/shared/server/aiSettings";
import { getCurrentUserAiAuth } from "@/domains/Auth/shared/server/setupToken";
import { buildRecommendationContext } from "@/domains/Interviews/features/interview-assessment/server/queries/buildRecommendationContext";
import type {
  AnalysisJson,
  Decision,
  RecommendationJson,
} from "@/domains/Interviews/features/interview-assessment/types";
import { addProcessoAiCost } from "./addProcessoAiCost";
import { ProcessoNotFoundError } from "./computeFitScore";

export type EvaluateInterviewResult = {
  id: string;
  decisao: Decision;
  confianca: number;
  justificativa: string;
};

// Avalia uma transcrição de entrevista a partir do card do candidato: roda a
// análise + a recomendação (decisão APROVAR/REPROVAR), grava a avaliação ligada
// ao processo e acumula o custo. NÃO altera o status/coluna do processo — a
// decisão de mover o card continua sendo do recrutador (humano decide).
export async function evaluateInterviewForProcesso(
  processoId: string,
  transcricao: string,
): Promise<EvaluateInterviewResult> {
  const processo = await prisma.processos_seletivos.findUnique({
    where: { id: processoId },
    select: {
      candidatos: { select: { nome: true } },
      vagas: { select: { titulo: true, posicao_id: true } },
    },
  });
  if (!processo) throw new ProcessoNotFoundError();

  const settings = await getAiSettings();
  const { setupToken, apiKey } = await getCurrentUserAiAuth();
  let inputTokens = 0;
  let outputTokens = 0;

  // 1. Análise comportamental.
  const analysisRes = await claudeMessageRaw({
    system: settings.analysisPrompt,
    user: transcricao,
    model: settings.model,
    setupToken,
    apiKey,
  });
  inputTokens += analysisRes.usage.inputTokens;
  outputTokens += analysisRes.usage.outputTokens;
  const analysis = extractJson<AnalysisJson>(analysisRes.text);

  const posicaoId = processo.vagas.posicao_id;

  // 2. Cria a avaliação ligada ao processo (com a análise).
  const created = await prisma.avaliacoes_entrevista.create({
    data: {
      processo_id: processoId,
      posicao_id: posicaoId,
      candidato_nome: processo.candidatos.nome,
      cargo: processo.vagas.titulo,
      transcricao,
      analise_json: analysis as unknown as Prisma.InputJsonValue,
    },
    select: { id: true },
  });

  // 3. Recomendação comparativa (mesmo candidato + mesma posição).
  const context = await buildRecommendationContext({
    id: created.id,
    candidatoNome: processo.candidatos.nome,
    posicaoId,
    analysis,
  });
  const recRes = await claudeMessageRaw({
    system: settings.recommendationPrompt,
    user: context,
    model: settings.model,
    setupToken,
    apiKey,
  });
  inputTokens += recRes.usage.inputTokens;
  outputTokens += recRes.usage.outputTokens;
  const recommendation = extractJson<RecommendationJson>(recRes.text);

  // Guarda contra saída fora do enum (evita erro/lixo no banco).
  if (
    recommendation.recomendacao !== "APROVAR" &&
    recommendation.recomendacao !== "REPROVAR"
  ) {
    throw new Error("AI_BAD_OUTPUT");
  }

  await prisma.avaliacoes_entrevista.update({
    where: { id: created.id },
    data: {
      recomendacao_json: recommendation as unknown as Prisma.InputJsonValue,
      decisao: recommendation.recomendacao,
    },
  });

  await addProcessoAiCost(processoId, settings.model, {
    inputTokens,
    outputTokens,
  });

  return {
    id: created.id,
    decisao: recommendation.recomendacao,
    confianca: recommendation.confianca,
    justificativa: recommendation.justificativa,
  };
}
