import { z } from "zod";

export const origemValues = [
  "Hunting",
  "Gupy",
  "Indicacao",
  "LinkedIn",
  "Outro",
] as const;

export const candidatoFilterSchema = z.object({
  q: z.string().optional(),
  origem: z.enum(origemValues).optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
});

export type CandidatoFilterInput = z.input<typeof candidatoFilterSchema>;
export type CandidatoFilterOutput = z.output<typeof candidatoFilterSchema>;
