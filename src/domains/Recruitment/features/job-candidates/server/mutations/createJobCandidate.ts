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

// Já existe um candidato com esse linkedin_url — deve ser vinculado (não recriado).
export class CandidatoExistsError extends Error {
  constructor(public readonly candidatoId: string) {
    super("CANDIDATO_EXISTS");
    this.name = "CandidatoExistsError";
  }
}

// Candidato informado para vínculo não existe (ou foi removido).
export class CandidatoNotFoundError extends Error {
  constructor() {
    super("CANDIDATO_NOT_FOUND");
    this.name = "CandidatoNotFoundError";
  }
}

// Abre o processo seletivo (candidato ↔ vaga) + etapa inicial (Triagem),
// e devolve o card. Duplicidade na vaga → CandidatoAlreadyInJobError.
async function openProcesso(
  vagaId: string,
  candidatoId: string,
): Promise<JobCandidateDTO> {
  try {
    const processo = await prisma.processos_seletivos.create({
      data: { vaga_id: vagaId, candidato_id: candidatoId },
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

// Cadastra um candidato NOVO numa vaga. Se já existir um candidato com o mesmo
// linkedin_url, NÃO recria nem sobrescreve — lança CandidatoExistsError para o
// usuário vinculá-lo pela busca (evita perda dos dados digitados).
export async function createJobCandidate(
  vagaId: string,
  input: CreateCandidatoInput,
): Promise<JobCandidateDTO> {
  const existing = await prisma.candidatos.findFirst({
    where: { linkedin_url: input.linkedin_url, deleted_at: null },
    select: { id: true },
  });
  if (existing) throw new CandidatoExistsError(existing.id);

  const candidato = await prisma.candidatos.create({
    data: {
      nome: input.nome,
      linkedin_url: input.linkedin_url,
      email: input.email ?? null,
      telefone: input.telefone ?? null,
      origem: input.origem ?? null,
      pretensao_salarial: input.pretensao_salarial ?? null,
      dados_extraidos: input.dados_extraidos
        ? { texto: input.dados_extraidos }
        : undefined,
    },
    select: { id: true },
  });

  return openProcesso(vagaId, candidato.id);
}

// Vincula um candidato EXISTENTE (da base) à vaga.
export async function linkCandidateToJob(
  vagaId: string,
  candidatoId: string,
): Promise<JobCandidateDTO> {
  const exists = await prisma.candidatos.findFirst({
    where: { id: candidatoId, deleted_at: null },
    select: { id: true },
  });
  if (!exists) throw new CandidatoNotFoundError();

  return openProcesso(vagaId, candidatoId);
}
