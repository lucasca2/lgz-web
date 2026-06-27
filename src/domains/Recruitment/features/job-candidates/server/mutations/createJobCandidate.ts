import "server-only";

import { prisma } from "@/shared/lib/prisma";
import { getEtapaCatalogoMap } from "@/domains/Recruitment/features/candidate-board/server/etapasCatalogo";
import type { CreateCandidatoInput } from "../../schemas/candidatoSchemas";
import type { JobCandidateDTO, ProcessoStatus } from "../../types";
import type { Origem } from "../../schemas/candidatoSchemas";

// Etapa inicial do pipeline (primeira coluna do kanban).
const INITIAL_STAGE = "Triagem";

// Candidato já está nesta vaga (unique [vaga_id, candidato_id]).
export class CandidatoAlreadyInJobError extends Error {
  constructor() {
    super("CANDIDATO_ALREADY_IN_JOB");
    this.name = "CandidatoAlreadyInJobError";
  }
}

// Cadastra um candidato numa vaga: reaproveita o `candidatos` existente pela
// `linkedin_url` (unique) ou cria um novo; depois abre o `processos_seletivos`
// ligando candidato + vaga (status inicial = Em andamento).
export async function createJobCandidate(
  vagaId: string,
  input: CreateCandidatoInput,
): Promise<JobCandidateDTO> {
  // 1. Candidato: reusa se já existe (não removido), senão cria.
  const existing = await prisma.candidatos.findFirst({
    where: { linkedin_url: input.linkedin_url, deleted_at: null },
    select: { id: true },
  });

  const candidato = existing
    ? existing
    : await prisma.candidatos.create({
        data: {
          nome: input.nome,
          linkedin_url: input.linkedin_url,
          email: input.email ?? null,
          telefone: input.telefone ?? null,
          origem: input.origem ?? null,
          pretensao_salarial: input.pretensao_salarial ?? null,
        },
        select: { id: true },
      });

  // 2. Processo seletivo: liga candidato + vaga.
  try {
    const processo = await prisma.processos_seletivos.create({
      data: { vaga_id: vagaId, candidato_id: candidato.id },
      select: {
        id: true,
        candidato_id: true,
        status_atual: true,
        score_fit_cultural: true,
        created_at: true,
        candidatos: {
          select: { nome: true, linkedin_url: true, email: true, origem: true },
        },
      },
    });

    // Etapa inicial do pipeline (Triagem) — coloca o candidato na 1ª coluna do board.
    const etapaMap = await getEtapaCatalogoMap();
    const triagemId = etapaMap.get(INITIAL_STAGE);
    if (triagemId) {
      await prisma.historico_etapas.create({
        data: { processo_id: processo.id, etapa_catalogo_id: triagemId },
      });
    }

    return {
      id: processo.id,
      candidatoId: processo.candidato_id,
      nome: processo.candidatos.nome,
      linkedinUrl: processo.candidatos.linkedin_url,
      email: processo.candidatos.email,
      origem: (processo.candidatos.origem as Origem | null) ?? null,
      score: processo.score_fit_cultural,
      status: processo.status_atual as ProcessoStatus,
      createdAt: processo.created_at.toISOString(),
    };
  } catch (err) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code?: string }).code === "P2002"
    ) {
      throw new CandidatoAlreadyInJobError();
    }
    throw err;
  }
}
