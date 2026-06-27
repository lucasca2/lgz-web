import "server-only";

import { prisma } from "@/shared/lib/prisma";
import type { CandidatoFilterOutput } from "../../schemas/candidatoFilterSchema";
import type { CandidatosResponse } from "../../types";

export async function listCandidatos(
  filters: CandidatoFilterOutput,
): Promise<CandidatosResponse> {
  const { q, origem, page, pageSize } = filters;
  const skip = (page - 1) * pageSize;

  const where = {
    deleted_at: null as null,
    ...(q
      ? {
          OR: [
            { nome: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(origem ? { origem } : {}),
  };

  const [candidatos, total] = await Promise.all([
    prisma.candidatos.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        origem: true,
        pretensao_salarial: true,
        created_at: true,
      },
    }),
    prisma.candidatos.count({ where }),
  ]);

  return {
    data: candidatos.map((c) => ({
      ...c,
      pretensao_salarial: c.pretensao_salarial?.toString() ?? null,
      created_at: c.created_at.toISOString(),
    })),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
