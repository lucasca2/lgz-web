import "server-only";

import { prisma } from "@/shared/lib/prisma";

export type CandidatoSearchResult = {
  id: string;
  nome: string;
  linkedinUrl: string;
  processosCount: number;
};

// Busca candidatos na base por nome OU linkedin_url (case-insensitive),
// ignorando os removidos. Usado no autocomplete do cadastro.
export async function searchCandidatos(
  q: string,
): Promise<CandidatoSearchResult[]> {
  const term = q.trim();
  if (term.length < 2) return [];

  const rows = await prisma.candidatos.findMany({
    where: {
      deleted_at: null,
      OR: [
        { nome: { contains: term, mode: "insensitive" } },
        { linkedin_url: { contains: term, mode: "insensitive" } },
      ],
    },
    orderBy: { nome: "asc" },
    take: 8,
    select: {
      id: true,
      nome: true,
      linkedin_url: true,
      _count: { select: { processos_seletivos: true } },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    nome: row.nome,
    linkedinUrl: row.linkedin_url,
    processosCount: row._count.processos_seletivos,
  }));
}
