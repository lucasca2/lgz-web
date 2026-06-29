import "server-only";

import { prisma } from "@/shared/lib/prisma";

export type UsuarioOption = { id: string; nome: string; email: string };

// Lista usuários ativos para pickers (ex.: hiring manager da vaga).
export async function listActiveUsuarios(): Promise<UsuarioOption[]> {
  return prisma.usuarios.findMany({
    where: { ativo: true },
    select: { id: true, nome: true, email: true },
    orderBy: { nome: "asc" },
  });
}
