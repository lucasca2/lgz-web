"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRoutes } from "../../constants/apiRoutes";
import type { BoardCardDTO } from "../../types";

// `vagaId` opcional: filtra o board pelos candidatos de uma vaga (tela de detalhe).
export function boardCardsKey(vagaId?: string) {
  return ["candidate-board", vagaId ?? null] as const;
}

export function useBoardCards(vagaId?: string) {
  return useQuery({
    queryKey: boardCardsKey(vagaId),
    queryFn: async (): Promise<BoardCardDTO[]> => {
      const url = vagaId
        ? `${apiRoutes.board}?vagaId=${encodeURIComponent(vagaId)}`
        : apiRoutes.board;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch candidate board");
      return res.json();
    },
  });
}
