"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRoutes } from "../../constants/apiRoutes";
import type { PositionDTO } from "../../types";

export function usePositions() {
  return useQuery({
    queryKey: ["positions"],
    queryFn: async (): Promise<PositionDTO[]> => {
      const res = await fetch(apiRoutes.positions);
      if (!res.ok) throw new Error("Failed to fetch positions");
      return res.json();
    },
  });
}
