import "server-only";

import { prisma } from "@/shared/lib/prisma";
import { processo_status } from "@/generated/prisma/enums";
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

// Persiste a etapa (coluna) de cada card movido em `historico_etapas` (mantém uma
// linha "atual" por processo) e sincroniza o `status_atual`. Não há coluna de
// ordem no banco, então a reordenação intra-coluna é só visual.
export async function saveBoardOrder(input: BoardOrderInput, vagaId?: string) {
  const etapaMap = await getEtapaCatalogoMap();

  for (const { id, stage } of input.order) {
    const etapaId = etapaMap.get(stage);
    if (!etapaId) continue; // etapa fora do catálogo — ignora por segurança

    const updated = await prisma.historico_etapas.updateMany({
      where: { processo_id: id },
      data: { etapa_catalogo_id: etapaId },
    });

    if (updated.count === 0) {
      await prisma.historico_etapas.create({
        data: { processo_id: id, etapa_catalogo_id: etapaId },
      });
    }

    await prisma.processos_seletivos.update({
      where: { id },
      data: { status_atual: statusForStage(stage) },
    });
  }

  return getBoardCards(vagaId);
}
