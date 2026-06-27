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
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
