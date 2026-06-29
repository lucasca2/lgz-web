"use client";

import { useQuery } from "@tanstack/react-query";
import { schedulingApiRoutes } from "@/domains/Scheduling/shared/constants/apiRoutes";
import type { RecommendedParticipant } from "@/domains/Scheduling/shared/types";

// Participantes recomendados para a posição (aprendidos do histórico de convites).
// Habilita só quando há uma posição (veio do board via query param).
export function useRecommendations(position: string | undefined) {
  const p = (position ?? "").trim();
  return useQuery({
    queryKey: ["scheduling", "recommendations", p.toLowerCase()],
    enabled: p.length > 0,
    staleTime: 60_000,
    queryFn: async (): Promise<RecommendedParticipant[]> => {
      const res = await fetch(schedulingApiRoutes.recommendations(p));
      if (!res.ok) {
        throw Object.assign(new Error("RECOMMENDATIONS_FAILED"), {
          status: res.status,
        });
      }
      const data = (await res.json()) as {
        participants: RecommendedParticipant[];
      };
      return data.participants;
    },
  });
}
