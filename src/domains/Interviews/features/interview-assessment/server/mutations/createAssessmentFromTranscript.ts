import "server-only";

import { prisma } from "@/shared/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { runAnalysis } from "../ai";
import { toAssessmentDTO } from "../assessmentMapper";
import type { AssessmentDTO } from "../../types";

type Input = { transcricao: string; posicaoId?: string | null };

// Roda a análise comportamental e cria o registro da avaliação.
export async function createAssessmentFromTranscript(
  input: Input,
): Promise<AssessmentDTO> {
  const analysis = await runAnalysis(input.transcricao);

  const row = await prisma.avaliacoes_entrevista.create({
    data: {
      transcricao: input.transcricao,
      posicao_id: input.posicaoId ?? null,
      candidato_nome: analysis.nome_candidato?.trim() || "Não identificado",
      cargo: analysis.cargo_pretendido?.trim() || null,
      analise_json: analysis as unknown as Prisma.InputJsonValue,
    },
    include: { posicoes: { select: { nome: true, nivel: true } } },
  });

  return toAssessmentDTO(row);
}
