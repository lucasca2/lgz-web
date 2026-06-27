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
});

export type CreateJobInput = z.infer<typeof createJobSchema>;

export const updateJobStatusSchema = z.object({
  status: z.enum(JOB_STATUSES),
});

export type UpdateJobStatusInput = z.infer<typeof updateJobStatusSchema>;
