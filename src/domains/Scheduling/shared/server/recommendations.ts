import "server-only";

import type { RecommendedParticipant } from "@/domains/Scheduling/shared/types";
import { prisma } from "@/shared/lib/prisma";

// Quantos convites passados olhar e quantas recomendações devolver.
const HISTORY_LIMIT = 200;
const MAX_RECOMMENDATIONS = 8;

type Tally = {
  email: string;
  count: number; // em quantos convites a pessoa entrou
  requiredCount: number; // em quantos foi marcada como obrigatória
  lastUsed: number; // índice de recência (menor = mais recente)
};

function asEmailArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}

// Recomenda participantes para uma posição, aprendendo dos convites já criados:
// ranqueia por frequência de uso e, em empate, por recência. Sugere a pessoa
// como obrigatória quando ela costuma ser obrigatória (maioria dos usos).
export async function getParticipantRecommendations(
  position: string,
): Promise<RecommendedParticipant[]> {
  const normalized = position.trim().toLowerCase();
  if (!normalized) return [];

  const rows = await prisma.convites_agendamento.findMany({
    where: { posicao: normalized },
    select: { incluidos: true, obrigatorios: true },
    orderBy: { created_at: "desc" },
    take: HISTORY_LIMIT,
  });

  const tally = new Map<string, Tally>();
  rows.forEach((row, index) => {
    const included = asEmailArray(row.incluidos);
    const required = new Set(asEmailArray(row.obrigatorios));
    for (const email of included) {
      const current = tally.get(email);
      if (current) {
        current.count += 1;
        if (required.has(email)) current.requiredCount += 1;
      } else {
        tally.set(email, {
          email,
          count: 1,
          requiredCount: required.has(email) ? 1 : 0,
          lastUsed: index, // rows já vêm do mais recente p/ o mais antigo
        });
      }
    }
  });

  return Array.from(tally.values())
    .sort((a, b) => b.count - a.count || a.lastUsed - b.lastUsed)
    .slice(0, MAX_RECOMMENDATIONS)
    .map((t) => ({
      email: t.email,
      required: t.requiredCount * 2 >= t.count, // obrigatória na maioria dos usos
    }));
}
