import "server-only";

import { prisma } from "@/shared/lib/prisma";
import { estimateCostUsd } from "@/domains/Interviews/shared/constants/aiPricing";
import type { ClaudeUsage } from "@/shared/lib/anthropic";

// Acumula tokens + custo estimado de uma chamada de IA no processo seletivo.
// Popula processos_seletivos.tokens_consumidos / custo_estimado_usd (rastreio
// de gasto de IA por processo).
export async function addProcessoAiCost(
  processoId: string,
  model: string,
  usage: ClaudeUsage,
): Promise<void> {
  const tokens = usage.inputTokens + usage.outputTokens;
  const custo = estimateCostUsd(model, usage);

  await prisma.processos_seletivos.update({
    where: { id: processoId },
    data: {
      tokens_consumidos: { increment: tokens },
      custo_estimado_usd: { increment: custo },
    },
  });
}
