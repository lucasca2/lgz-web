import "server-only";

import { prisma } from "@/shared/lib/prisma";
import { etapa_status, processo_status } from "@/generated/prisma/enums";
import { APPROVED_STAGE, REJECTED_STAGE } from "../../constants/stages";
import { getEtapaCatalogoMap } from "../etapasCatalogo";
import { getBoardCards } from "../queries/getBoardCards";
import type { BoardOrderInput } from "../../schemas/boardSchemas";

// Status do processo derivado da coluna terminal (etapas do meio = Em andamento).
function statusForStage(stage: string): processo_status {
  if (stage === APPROVED_STAGE) return processo_status.Aprovado;
  if (stage === REJECTED_STAGE) return processo_status.Reprovado;
  return processo_status.Em_andamento;
}

// Persiste movimentos do board como TRANSIÇÕES reais no histórico de etapas:
// para cada card cuja coluna mudou, fecha a etapa atual (Executada + data_fim) e
// insere uma nova linha (Em_Andamento) com a justificativa do movimento; depois
// sincroniza o status_atual e, nas colunas terminais, grava os campos de decisão
// do processo (justificativa_fit / comentario_reprovacao). Cada card é atômico.
export async function saveBoardOrder(input: BoardOrderInput, vagaId?: string) {
  const etapaMap = await getEtapaCatalogoMap();
  const justifications = input.justifications ?? {};

  for (const { id, stage } of input.order) {
    const etapaId = etapaMap.get(stage);
    if (!etapaId) continue; // etapa fora do catálogo — ignora por segurança

    // Etapa atual = última transição registrada do processo.
    const current = await prisma.historico_etapas.findFirst({
      where: { processo_id: id },
      orderBy: { data_inicio: "desc" },
      select: { id: true, etapa_catalogo_id: true },
    });

    // Sem mudança de coluna → nada a fazer (reordenar dentro da coluna é só visual).
    if (current && current.etapa_catalogo_id === etapaId) continue;

    const justificativa = justifications[id] ?? null;

    await prisma.$transaction(async (tx) => {
      if (current) {
        await tx.historico_etapas.update({
          where: { id: current.id },
          data: { status_etapa: etapa_status.Executada, data_fim: new Date() },
        });
      }

      await tx.historico_etapas.create({
        data: {
          processo_id: id,
          etapa_catalogo_id: etapaId,
          status_etapa: etapa_status.Em_Andamento,
          justificativa,
        },
      });

      await tx.processos_seletivos.update({
        where: { id },
        data: {
          status_atual: statusForStage(stage),
          ...(stage === APPROVED_STAGE && justificativa
            ? { justificativa_fit: justificativa }
            : {}),
          ...(stage === REJECTED_STAGE && justificativa
            ? { comentario_reprovacao: justificativa }
            : {}),
        },
      });
    });
  }

  return getBoardCards(vagaId);
}
