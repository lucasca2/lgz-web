"use client";

import { useQuery } from "@tanstack/react-query";
import type { CandidatoEditDTO } from "../../types";

// Carrega os dados editáveis de um candidato para preencher o form de edição.
// Só dispara quando há id e `enabled` (modal aberta).
export function useCandidatoForEdit(
  candidatoId: string | null,
  enabled = true,
) {
  return useQuery({
    queryKey: ["candidato-edit", candidatoId],
    enabled: enabled && candidatoId != null,
    queryFn: async (): Promise<CandidatoEditDTO> => {
      const res = await fetch(`/api/candidatos/${candidatoId}`);
      if (!res.ok) throw new Error("load_candidato_failed");
      return res.json();
    },
  });
}
