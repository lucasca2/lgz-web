import "server-only";

import { prisma } from "@/shared/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { toListItem } from "../assessmentMapper";
import type {
  AssessmentListResponse,
  AssessmentStatusFilter,
} from "../../types";

type Args = {
  page: number;
  limit: number;
  status: AssessmentStatusFilter;
  search: string;
};

// Ciclo de vida derivado das colunas: APROVAR/REPROVAR (decisao), "pending"
// (analisado sem decisão) e "draft" (sem análise nem decisão).
export async function listAssessments({
  page,
  limit,
  status,
  search,
}: Args): Promise<AssessmentListResponse> {
  const where: Prisma.avaliacoes_entrevistaWhereInput = {};

  if (status === "approved") where.decisao = "APROVAR";
  else if (status === "rejected") where.decisao = "REPROVAR";
  else if (status === "pending") {
    where.decisao = null;
    where.analise_json = { not: Prisma.DbNull };
  } else if (status === "draft") {
    where.decisao = null;
    where.analise_json = { equals: Prisma.DbNull };
  }

  if (search) {
    where.OR = [
      { candidato_nome: { contains: search, mode: "insensitive" } },
      { cargo: { contains: search, mode: "insensitive" } },
    ];
  }

  const [total, rows] = await Promise.all([
    prisma.avaliacoes_entrevista.count({ where }),
    prisma.avaliacoes_entrevista.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        candidato_nome: true,
        cargo: true,
        decisao: true,
        analise_json: true,
        recomendacao_json: true,
        transcricao: true,
        created_at: true,
        posicoes: { select: { nome: true, nivel: true } },
      },
    }),
  ]);

  return {
    items: rows.map(toListItem),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}
