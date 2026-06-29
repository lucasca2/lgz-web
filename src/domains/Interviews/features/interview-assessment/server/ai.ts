import "server-only";

import {
  claudeMessage,
  extractJson,
  stripMarkdownFences,
} from "@/shared/lib/anthropic";
import { getAiSettings } from "@/domains/Interviews/shared/server/aiSettings";
import { getCurrentUserAiAuth } from "@/domains/Auth/shared/server/setupToken";
import type { AnalysisJson, RecommendationJson } from "../types";

// Análise comportamental: transcrição → JSON estruturado.
export async function runAnalysis(transcricao: string): Promise<AnalysisJson> {
  const settings = await getAiSettings();
  const { setupToken, apiKey } = await getCurrentUserAiAuth();
  const text = await claudeMessage({
    system: settings.analysisPrompt,
    user: transcricao,
    model: settings.model,
    setupToken,
    apiKey,
  });
  return extractJson<AnalysisJson>(text);
}

// Resumo estruturado da entrevista em Markdown.
export async function runSummary(transcricao: string): Promise<string> {
  const settings = await getAiSettings();
  const { setupToken, apiKey } = await getCurrentUserAiAuth();
  const text = await claudeMessage({
    system: settings.summaryPrompt,
    user: transcricao,
    model: settings.model,
    setupToken,
    apiKey,
  });
  return stripMarkdownFences(text);
}

// Recomendação comparativa: recebe o contexto já montado (candidato atual +
// histórico do mesmo candidato + últimas avaliações da mesma posição).
export async function runRecommendation(
  contextMessage: string,
): Promise<RecommendationJson> {
  const settings = await getAiSettings();
  const { setupToken, apiKey } = await getCurrentUserAiAuth();
  const text = await claudeMessage({
    system: settings.recommendationPrompt,
    user: contextMessage,
    model: settings.model,
    setupToken,
    apiKey,
  });
  return extractJson<RecommendationJson>(text);
}

// Modelo de resposta de reprovação (devolutiva ao candidato).
export async function runRejectionTemplate(
  analysis: AnalysisJson,
  recommendation: RecommendationJson | null,
): Promise<string> {
  const settings = await getAiSettings();
  const { setupToken, apiKey } = await getCurrentUserAiAuth();
  const msg = `## Análise Comportamental\n${JSON.stringify(
    analysis,
    null,
    2,
  )}\n\n## Recomendação\n${JSON.stringify(recommendation ?? {}, null, 2)}`;

  const text = await claudeMessage({
    system: settings.rejectionTemplatePrompt,
    user: msg,
    model: settings.model,
    setupToken,
    apiKey,
  });
  const parsed = extractJson<{ justificativa: string }>(text);
  return parsed.justificativa;
}
