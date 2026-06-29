import { z } from "zod";

export const JOB_STATUSES = [
  "Aberta",
  "Fechada",
  "Stand-by",
  "Cancelada",
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];

export const createJobSchema = z.object({
  title: z.string().trim().min(1).max(200),
  project: z.string().trim().min(1).max(200),
  status: z.enum(JOB_STATUSES),
  // Descrição livre da vaga — opcional. Texto vazio é tratado como ausente.
  description: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((value) => value || undefined),
  // Vínculo com o catálogo de posições (alimenta o escopo do score por IA).
  posicaoId: z.string().uuid().optional(),
  budget: z.number().nonnegative().max(999_999_999).optional(),
  prioridade: z.number().int().min(1).max(5).optional(),
  hiringManagerId: z.string().uuid().optional(),
  // Data (YYYY-MM-DD) vinda de <input type="date">.
  dataFechamento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;

export const updateJobStatusSchema = z.object({
  status: z.enum(JOB_STATUSES),
});

export type UpdateJobStatusInput = z.infer<typeof updateJobStatusSchema>;
