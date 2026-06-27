import "server-only";

import { prisma } from "@/shared/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { toAssessmentDTO } from "../assessmentMapper";
import type { AssessmentDTO } from "../../types";
import type { UpdateAssessmentInput } from "../../schemas/assessmentSchemas";

// Decisão manual (override) e/ou associação de posição (especialidade).
export async function updateAssessment(
  id: string,
  input: UpdateAssessmentInput,
): Promise<AssessmentDTO | null> {
  const data: Prisma.avaliacoes_entrevistaUpdateInput = {};

  if (input.decisao !== undefined) {
    data.decisao = input.decisao ?? null;
  }
  if (input.justificativa !== undefined) {
    data.justificativa_manual = input.justificativa?.trim() || null;
  }
  if (input.posicaoId !== undefined) {
    data.posicoes = input.posicaoId
      ? { connect: { id: input.posicaoId } }
      : { disconnect: true };
  }

  const existing = await prisma.avaliacoes_entrevista.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) return null;

  const row = await prisma.avaliacoes_entrevista.update({
    where: { id },
    data,
    include: { posicoes: { select: { nome: true, nivel: true } } },
  });

  return toAssessmentDTO(row);
}
