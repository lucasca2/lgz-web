"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRoutes } from "../../constants/apiRoutes";
import type { CreatePositionInput } from "../../schemas/positionSchemas";
import type { PositionDTO } from "../../types";

type UpdatePositionInput = CreatePositionInput & { id: string };

export function useUpdatePosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: UpdatePositionInput): Promise<PositionDTO> => {
      const res = await fetch(`${apiRoutes.positions}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Failed to update position");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] });
    },
  });
}
