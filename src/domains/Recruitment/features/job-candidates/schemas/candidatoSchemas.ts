import { z } from "zod";

// Espelha o enum `origem_candidato` do banco (src/generated/prisma/enums).
export const ORIGEM_VALUES = [
  "Hunting",
  "Gupy",
  "Indicacao",
  "LinkedIn",
  "Outro",
] as const;

export type Origem = (typeof ORIGEM_VALUES)[number];

// E-mail normalizado (trim + lowercase) antes de validar o formato.
const email = z.string().trim().toLowerCase().pipe(z.email());

export const createCandidatoSchema = z.object({
  nome: z.string().trim().min(2).max(255),
  linkedin_url: z.string().trim().url().max(512),
  email: email.optional(),
  telefone: z.string().trim().max(50).optional(),
  origem: z.enum(ORIGEM_VALUES).optional(),
  pretensao_salarial: z.number().min(0).optional(),
});

export type CreateCandidatoInput = z.infer<typeof createCandidatoSchema>;
