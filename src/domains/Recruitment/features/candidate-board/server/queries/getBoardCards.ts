import "server-only";

import { prisma } from "@/shared/lib/prisma";
import {
  APPROVED_STAGE,
  BOARD_STAGES,
  REJECTED_STAGE,
  type BoardStage,
} from "../../constants/stages";
import type { BoardCardDTO } from "../../types";

function isBoardStage(value: string): value is BoardStage {
  return (BOARD_STAGES as readonly string[]).includes(value);
}

// Etapa exibida quando o processo ainda não tem histórico: deriva do status_atual.
function fallbackStage(status: string): BoardStage {
  if (status === "Aprovado") return APPROVED_STAGE;
  if (status === "Reprovado") return REJECTED_STAGE;
  return "Triagem";
}

// Server-only: monta os cards do board a partir dos processos seletivos. A coluna
// (`stage`) é a etapa atual (último `historico_etapas`); `score` = score_fit_cultural;
// inclui a entrevista mais recente, se houver. `vagaId` filtra por vaga.
export async function getBoardCards(vagaId?: string): Promise<BoardCardDTO[]> {
  const rows = await prisma.processos_seletivos.findMany({
    where: {
      candidatos: { deleted_at: null },
      ...(vagaId ? { vaga_id: vagaId } : {}),
    },
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      status_atual: true,
      score_fit_cultural: true,
      candidatos: { select: { nome: true } },
      vagas: { select: { titulo: true, projeto: true } },
      historico_etapas: {
        orderBy: { data_inicio: "desc" },
        take: 1,
        select: { etapas_catalogo: { select: { nome: true } } },
      },
      entrevistas: {
        orderBy: { created_at: "desc" },
        take: 1,
        select: { status: true, data_hora_inicio: true },
      },
    },
  });

  return rows.map((row) => {
    const etapaNome = row.historico_etapas[0]?.etapas_catalogo.nome;
    const stage =
      etapaNome && isBoardStage(etapaNome)
        ? etapaNome
        : fallbackStage(row.status_atual);

    const entrevista = row.entrevistas[0];
    return {
      id: row.id,
      candidateName: row.candidatos.nome,
      project: row.vagas.projeto,
      position: row.vagas.titulo,
      stage,
      score: row.score_fit_cultural,
      interview: entrevista
        ? {
            dataHora: entrevista.data_hora_inicio?.toISOString() ?? null,
            status: entrevista.status,
          }
        : null,
    };
  });
}
