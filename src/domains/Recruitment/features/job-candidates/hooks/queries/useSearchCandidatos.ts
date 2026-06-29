"use client";

import { useQuery } from "@tanstack/react-query";

export type CandidatoSearchResult = {
  id: string;
  nome: string;
  linkedinUrl: string;
  processosCount: number;
};

// Busca candidatos na base (autocomplete). Só dispara com 2+ caracteres.
export function useSearchCandidatos(q: string) {
  const term = q.trim();
  return useQuery({
    queryKey: ["candidatos-search", term],
    enabled: term.length >= 2,
    queryFn: async (): Promise<CandidatoSearchResult[]> => {
      const res = await fetch(
        `/api/candidatos/search?q=${encodeURIComponent(term)}`,
      );
      if (!res.ok) throw new Error("search_failed");
      return res.json();
    },
  });
}
