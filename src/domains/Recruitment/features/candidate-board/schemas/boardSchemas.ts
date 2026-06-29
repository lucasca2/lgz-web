import { z } from "zod";

import { BOARD_STAGES } from "../constants/stages";

export const boardOrderSchema = z.object({
  order: z.array(
    z.object({
      id: z.string(),
      stage: z.enum(BOARD_STAGES),
    }),
  ),
  // Justificativa por card que mudou de coluna (id do processo → texto).
  justifications: z.record(z.string(), z.string()).optional(),
});

export type BoardOrderInput = z.infer<typeof boardOrderSchema>;
