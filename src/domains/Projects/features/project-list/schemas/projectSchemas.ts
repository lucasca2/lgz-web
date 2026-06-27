import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().trim().min(1).max(200),
  expectation: z.string().trim().min(1).max(2000),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
