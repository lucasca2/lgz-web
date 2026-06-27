import { z } from "zod";

export const DECISIONS = ["APROVAR", "REPROVAR"] as const;

export const STATUS_FILTERS = [
  "all",
  "approved",
  "rejected",
  "pending",
  "draft",
] as const;

// POST /api/avaliacoes/analyze — cria a avaliação a partir da transcrição.
export const analyzeSchema = z.object({
  transcricao: z.string().trim().min(1).max(200_000),
  posicaoId: z.string().uuid().nullish(),
});
export type AnalyzeInput = z.infer<typeof analyzeSchema>;

// PATCH /api/avaliacoes/[id] — decisão manual e/ou associação de posição.
export const updateAssessmentSchema = z
  .object({
    decisao: z.enum(DECISIONS).nullish(),
    justificativa: z.string().trim().max(8000).nullish(),
    posicaoId: z.string().uuid().nullish(),
  })
  .refine(
    (data) =>
      data.decisao !== undefined ||
      data.justificativa !== undefined ||
      data.posicaoId !== undefined,
    { message: "Nada a atualizar" },
  );
export type UpdateAssessmentInput = z.infer<typeof updateAssessmentSchema>;

// GET /api/avaliacoes — filtros de listagem.
export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(STATUS_FILTERS).default("all"),
  search: z.string().trim().default(""),
});
export type ListQueryInput = z.infer<typeof listQuerySchema>;

// PUT /api/avaliacoes/settings — modelo + prompts.
export const settingsSchema = z.object({
  model: z.string().trim().min(1).max(120),
  analysisPrompt: z.string().trim().min(1).max(20_000),
  recommendationPrompt: z.string().trim().min(1).max(20_000),
  summaryPrompt: z.string().trim().min(1).max(20_000),
  rejectionTemplatePrompt: z.string().trim().min(1).max(20_000),
});
export type SettingsInput = z.infer<typeof settingsSchema>;
