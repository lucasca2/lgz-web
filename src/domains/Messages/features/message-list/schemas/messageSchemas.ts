import { z } from "zod";

export const createMessageSchema = z.object({
  text: z.string().min(1).max(280),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
