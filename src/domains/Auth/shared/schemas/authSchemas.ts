import { z } from "zod";

// E-mail normalizado (trim + lowercase) antes de validar o formato.
const email = z.string().trim().toLowerCase().pipe(z.email());

export const signupSchema = z.object({
  name: z.string().trim().min(2).optional(),
  email,
  password: z
    .string()
    .min(8, "Deve ter ao menos 8 caracteres")
    .regex(/[a-zA-Z]/, "Deve conter ao menos uma letra")
    .regex(/[0-9]/, "Deve conter ao menos um número"),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
