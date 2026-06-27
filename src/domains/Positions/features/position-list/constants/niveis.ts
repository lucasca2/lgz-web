// Níveis de senioridade — espelham o enum `nivel_senioridade` do Prisma.
// Fonte única usada pelo schema Zod (validação) e pelo Select do formulário.
export const NIVEIS = ["Junior", "Pleno", "Senior", "Especialista"] as const;

export type Nivel = (typeof NIVEIS)[number];
