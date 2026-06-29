"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRoutes } from "../../constants/apiRoutes";
import { boardCardsKey } from "../queries/useBoardCards";
import type { BoardCardDTO } from "../../types";

type SaveBoardArgs = {
  cards: BoardCardDTO[];
  // Justificativa por card que mudou de coluna (id do processo → texto).
  justifications?: Record<string, string>;
};

export function useSaveBoardOrder(vagaId?: string) {
  const queryClient = useQueryClient();
  const key = boardCardsKey(vagaId);

  return useMutation({
    // Recebe o board já reordenado + justificativas e persiste (id, stage).
    mutationFn: async ({
      cards,
      justifications,
    }: SaveBoardArgs): Promise<BoardCardDTO[]> => {
      const url = vagaId
        ? `${apiRoutes.board}?vagaId=${encodeURIComponent(vagaId)}`
        : apiRoutes.board;
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order: cards.map((card) => ({ id: card.id, stage: card.stage })),
          ...(justifications ? { justifications } : {}),
        }),
      });
      if (!res.ok) throw new Error("Failed to save board order");
      return res.json();
    },
    // Atualização otimista: a ordem/coluna já está refletida na tela.
    onMutate: async ({ cards }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<BoardCardDTO[]>(key);
      queryClient.setQueryData<BoardCardDTO[]>(key, cards);
      return { previous };
    },
    onError: (_error, _cards, context) => {
      if (context?.previous) {
        queryClient.setQueryData(key, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key });
    },
  });
}
