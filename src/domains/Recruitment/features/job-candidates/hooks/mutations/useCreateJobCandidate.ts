"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRoutes } from "../../constants";
import type { CreateCandidatoInput } from "../../schemas/candidatoSchemas";
import type { JobCandidateDTO } from "../../types";

export function useCreateJobCandidate(vagaId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      input: CreateCandidatoInput,
    ): Promise<JobCandidateDTO> => {
      const res = await fetch(apiRoutes.candidates(vagaId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        throw Object.assign(new Error("Failed to create candidate"), {
          status: res.status,
        });
      }
      return res.json();
    },
    onSuccess: () => {
      // O kanban da vaga lê do board (processos_seletivos); revalida todas as
      // queries do board (incluindo a escopada por vaga).
      queryClient.invalidateQueries({ queryKey: ["candidate-board"] });
    },
  });
}
