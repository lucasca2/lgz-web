"use client";

import { useQuery } from "@tanstack/react-query";
import { schedulingApiRoutes } from "@/domains/Scheduling/shared/constants/apiRoutes";
import type { CandidateInviteResponse } from "@/domains/Scheduling/shared/types";

export const candidateInviteKey = (candidateId: string) =>
  ["scheduling", "candidateInvite", candidateId] as const;

// Convite atrelado a um candidato do board (alimenta o modal de detalhes).
// Só dispara quando há um candidateId (modal aberto).
export function useCandidateInvite(candidateId: string | null) {
  return useQuery({
    queryKey: candidateInviteKey(candidateId ?? ""),
    enabled: !!candidateId,
    queryFn: async (): Promise<CandidateInviteResponse> => {
      const res = await fetch(
        schedulingApiRoutes.candidateInvite(candidateId as string),
      );
      if (!res.ok) {
        throw Object.assign(new Error("CANDIDATE_INVITE_FAILED"), {
          status: res.status,
        });
      }
      return (await res.json()) as CandidateInviteResponse;
    },
  });
}
