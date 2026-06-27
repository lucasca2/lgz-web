"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRoutes } from "../../constants/apiRoutes";
import type { BoardCardDTO } from "../../types";

export function useBoardCards() {
  return useQuery({
    queryKey: ["candidate-board"],
    queryFn: async (): Promise<BoardCardDTO[]> => {
      const res = await fetch(apiRoutes.board);
      if (!res.ok) throw new Error("Failed to fetch candidate board");
      return res.json();
    },
  });
}
