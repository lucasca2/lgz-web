import { z } from "zod";
import { NIVEIS } from "../constants/niveis";

export const createPositionSchema = z.object({
  name: z.string().trim().min(1).max(200),
  nivel: z.enum(NIVEIS),
  descricao: z.string().trim().min(1).max(4000),
});

export type CreatePositionInput = z.infer<typeof createPositionSchema>;
