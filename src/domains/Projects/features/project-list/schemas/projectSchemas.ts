import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().trim().min(1).max(200),
  // Contexto é opcional — preenchido depois pelo usuário.
  expectation: z.string().trim().max(2000).optional().default(""),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
