"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

export type FitScoreResult = { score: number; justificativa: string };

type FetchError = Error & { status?: number };

// Dispara o cálculo do score de fit por IA para um processo.
export function useComputeScore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (processoId: string): Promise<FitScoreResult> => {
      const res = await fetch(`/api/candidate-board/${processoId}/score`, {
        method: "POST",
      });
      if (!res.ok) {
        const err: FetchError = new Error("compute_score_failed");
        err.status = res.status;
        throw err;
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidate-board"] });
    },
  });
}
