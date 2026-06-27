"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRoutes } from "../../constants/apiRoutes";
import type { BoardCardDTO } from "../../types";

export function useSaveBoardOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    // Recebe o board já reordenado e persiste só (id, stage) de cada card.
    mutationFn: async (cards: BoardCardDTO[]): Promise<BoardCardDTO[]> => {
      const res = await fetch(apiRoutes.board, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order: cards.map((card) => ({ id: card.id, stage: card.stage })),
        }),
      });
      if (!res.ok) throw new Error("Failed to save board order");
      return res.json();
    },
    // Atualização otimista: a ordem/coluna já está refletida na tela.
    onMutate: async (cards) => {
      await queryClient.cancelQueries({ queryKey: ["candidate-board"] });
      const previous = queryClient.getQueryData<BoardCardDTO[]>(["candidate-board"]);
      queryClient.setQueryData<BoardCardDTO[]>(["candidate-board"], cards);
      return { previous };
    },
    onError: (_error, _cards, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["candidate-board"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["candidate-board"] });
    },
  });
}
