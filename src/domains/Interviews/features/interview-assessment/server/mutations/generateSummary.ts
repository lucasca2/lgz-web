import "server-only";

import { prisma } from "@/shared/lib/prisma";
import { runSummary } from "../ai";
import { toAssessmentDTO } from "../assessmentMapper";
import { AssessmentNotFoundError } from "../errors";
import type { AssessmentDTO } from "../../types";

export async function generateSummary(id: string): Promise<AssessmentDTO> {
  const current = await prisma.avaliacoes_entrevista.findUnique({
    where: { id },
    select: { transcricao: true },
  });
  if (!current) throw new AssessmentNotFoundError();

  const summary = await runSummary(current.transcricao);

  const row = await prisma.avaliacoes_entrevista.update({
    where: { id },
    data: { resumo_markdown: summary },
    include: { posicoes: { select: { nome: true, nivel: true } } },
  });

  return toAssessmentDTO(row);
}
