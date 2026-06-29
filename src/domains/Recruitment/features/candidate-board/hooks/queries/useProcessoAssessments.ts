"use client";

import { useQuery } from "@tanstack/react-query";
import type { Decision } from "@/domains/Interviews/features/interview-assessment/types";

export type ProcessoAssessment = {
  id: string;
  decisao: Decision | null;
  confianca: number | null;
  justificativa: string | null;
  createdAt: string;
};

// Avaliações de entrevista de um processo (para exibir no card do candidato).
export function useProcessoAssessments(processoId: string | null) {
  return useQuery({
    queryKey: ["processo-assessments", processoId],
    enabled: processoId != null,
    queryFn: async (): Promise<ProcessoAssessment[]> => {
      const res = await fetch(
        `/api/candidate-board/${processoId}/avaliar-entrevista`,
      );
      if (!res.ok) throw new Error("load_assessments_failed");
      return res.json();
    },
  });
}
