import "server-only";

import { prisma } from "@/shared/lib/prisma";
import { DEFAULT_MODEL } from "../constants/aiModels";
import {
  DEFAULT_ANALYSIS_PROMPT,
  DEFAULT_RECOMMENDATION_PROMPT,
  DEFAULT_SUMMARY_PROMPT,
  DEFAULT_REJECTION_TEMPLATE_PROMPT,
} from "../constants/prompts";
import type { AiSettingsDTO } from "@/domains/Interviews/features/interview-assessment/types";

// Defaults usados quando a config global ainda não foi salva (ou está vazia).
export const AI_DEFAULTS: AiSettingsDTO = {
  model: DEFAULT_MODEL,
  analysisPrompt: DEFAULT_ANALYSIS_PROMPT,
  recommendationPrompt: DEFAULT_RECOMMENDATION_PROMPT,
  summaryPrompt: DEFAULT_SUMMARY_PROMPT,
  rejectionTemplatePrompt: DEFAULT_REJECTION_TEMPLATE_PROMPT,
};

const SINGLETON_ID = "singleton";

// Lê a config global e sobrepõe nos defaults (linha única, pode não existir).
export async function getAiSettings(): Promise<AiSettingsDTO> {
  const row = await prisma.configuracoes_avaliacao.findUnique({
    where: { id: SINGLETON_ID },
  });

  return {
    model: row?.model ?? AI_DEFAULTS.model,
    analysisPrompt: row?.analysis_prompt ?? AI_DEFAULTS.analysisPrompt,
    recommendationPrompt:
      row?.recommendation_prompt ?? AI_DEFAULTS.recommendationPrompt,
    summaryPrompt: row?.summary_prompt ?? AI_DEFAULTS.summaryPrompt,
    rejectionTemplatePrompt:
      row?.rejection_template_prompt ?? AI_DEFAULTS.rejectionTemplatePrompt,
  };
}

// Upsert da linha única de configuração.
export async function saveAiSettings(
  input: AiSettingsDTO,
): Promise<AiSettingsDTO> {
  await prisma.configuracoes_avaliacao.upsert({
    where: { id: SINGLETON_ID },
    create: {
      id: SINGLETON_ID,
      model: input.model,
      analysis_prompt: input.analysisPrompt,
      recommendation_prompt: input.recommendationPrompt,
      summary_prompt: input.summaryPrompt,
      rejection_template_prompt: input.rejectionTemplatePrompt,
    },
    update: {
      model: input.model,
      analysis_prompt: input.analysisPrompt,
      recommendation_prompt: input.recommendationPrompt,
      summary_prompt: input.summaryPrompt,
      rejection_template_prompt: input.rejectionTemplatePrompt,
    },
  });

  return getAiSettings();
}
