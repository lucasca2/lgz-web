"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRoutes } from "../../constants";
import type { JobCandidateDTO } from "../../types";

type FetchError = Error & { status?: number; code?: string };

// Vincula um candidato EXISTENTE (da base) à vaga.
export function useLinkCandidate(vagaId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (candidatoId: string): Promise<JobCandidateDTO> => {
      const res = await fetch(apiRoutes.candidates(vagaId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidatoId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const err: FetchError = new Error("link_candidate_failed");
        err.status = res.status;
        err.code = data?.error;
        throw err;
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidate-board"] });
    },
  });
}
