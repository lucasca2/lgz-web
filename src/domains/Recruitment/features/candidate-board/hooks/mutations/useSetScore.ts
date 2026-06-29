"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

// Define manualmente o score de fit de um processo.
export function useSetScore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      processoId,
      score,
    }: {
      processoId: string;
      score: number;
    }): Promise<{ score: number }> => {
      const res = await fetch(`/api/candidate-board/${processoId}/score`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score }),
      });
      if (!res.ok) throw new Error("set_score_failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidate-board"] });
    },
  });
}
