"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateCandidatoInput } from "../../schemas/candidatoSchemas";
import type { CandidatoEditDTO } from "../../types";

// Edita os dados de um candidato. Em erro, anexa `code` (linkedin_taken /
// email_taken / etc.) à exceção para o form reagir. Revalida o board (o nome
// no card vem do candidato) e a query de edição.
export function useUpdateCandidato() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: UpdateCandidatoInput;
    }): Promise<CandidatoEditDTO> => {
      const res = await fetch(`/api/candidatos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw Object.assign(new Error("update_candidato_failed"), {
          status: res.status,
          code: data?.error as string | undefined,
        });
      }
      return res.json();
    },
    onSuccess: (candidato) => {
      queryClient.invalidateQueries({ queryKey: ["candidate-board"] });
      queryClient.invalidateQueries({
        queryKey: ["candidato-edit", candidato.id],
      });
      queryClient.invalidateQueries({ queryKey: ["candidatos"] });
    },
  });
}
