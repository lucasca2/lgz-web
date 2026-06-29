import { z } from "zod";

// E-mail normalizado (trim + lowercase) antes de validar o formato.
const email = z.string().trim().toLowerCase().pipe(z.email());

// Domínio permitido para participantes internos.
export const BEMOBI_DOMAIN = "@bemobi.com";

// E-mail de participante: precisa ser do domínio @bemobi.com (candidatos, que são
// externos, usam o `email` cru no bookSchema).
const bemobiEmail = email.refine((e) => e.endsWith(BEMOBI_DOMAIN), {
  message: "must be a @bemobi.com address",
});

const emailList = z
  .string()
  .optional()
  .default("")
  .transform((s) =>
    s
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );

// GET /api/scheduling/slots — query params (recrutador).
export const slotsQuerySchema = z.object({
  weekOffset: z.coerce.number().int().min(0).default(0),
  duration: z.coerce.number().int().min(5).max(480).default(30),
  urgent: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  included: emailList,
  required: emailList,
});

// POST /api/scheduling/links — body (recrutador).
export const createLinkSchema = z.object({
  included: z.array(bemobiEmail).min(1),
  required: z.array(bemobiEmail).default([]),
  urgent: z.boolean().default(false),
  duration: z.number().int().min(5).max(480),
  slots: z.array(z.string().min(1)).min(1), // horários ISO ofertados
  title: z.string().trim().min(1).max(255).optional(),
  // Descrição do evento (digitada pelo recrutador) — opcional.
  description: z.string().trim().max(2000).optional(),
  // Candidato do board (id do card) a quem o link se destina — opcional.
  candidateId: z.string().trim().min(1).max(64).optional(),
  // Posição/cargo do candidato — usada para recomendar participantes depois.
  position: z.string().trim().min(1).max(255).optional(),
});

// POST /api/scheduling/links/:id/book — body (candidato).
export const bookSchema = z.object({
  start: z.string().min(1), // horário ISO escolhido
  email,
});

export type SlotsQuery = z.infer<typeof slotsQuerySchema>;
export type CreateLinkInput = z.infer<typeof createLinkSchema>;
export type BookInput = z.infer<typeof bookSchema>;
