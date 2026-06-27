import "server-only";

import { prisma } from "@/shared/lib/prisma";
import { toAssessmentDTO } from "../assessmentMapper";
import type { AssessmentDTO } from "../../types";

export async function getAssessmentById(
  id: string,
): Promise<AssessmentDTO | null> {
  const row = await prisma.avaliacoes_entrevista.findUnique({
    where: { id },
    include: { posicoes: { select: { nome: true, nivel: true } } },
  });
  if (!row) return null;
  return toAssessmentDTO(row);
}
