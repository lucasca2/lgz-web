"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRoutes } from "../../constants/apiRoutes";
import type { CreateProjectInput } from "../../schemas/projectSchemas";
import type { ProjectDTO } from "../../types";

type UpdateProjectInput = CreateProjectInput & { id: string };

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: UpdateProjectInput): Promise<ProjectDTO> => {
      const res = await fetch(`${apiRoutes.projects}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Failed to update project");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
