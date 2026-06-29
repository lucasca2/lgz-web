"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Decision } from "@/domains/Interviews/features/interview-assessment/types";

export type EvaluateInterviewResult = {
  id: string;
  decisao: Decision;
  confianca: number;
  justificativa: string;
};

// Avalia uma transcrição de entrevista a partir do card do candidato.
export function useEvaluateInterview(processoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transcricao: string): Promise<EvaluateInterviewResult> => {
      const res = await fetch(
        `/api/candidate-board/${processoId}/avaliar-entrevista`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcricao }),
        },
      );
      if (!res.ok) throw new Error("evaluate_interview_failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["processo-assessments", processoId],
      });
    },
  });
}
