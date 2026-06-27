"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRoutes } from "../../constants/apiRoutes";
import type { CreateJobInput } from "../../schemas/jobSchemas";
import type { JobDTO } from "../../types";

export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateJobInput): Promise<JobDTO> => {
      const res = await fetch(apiRoutes.jobs, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Failed to create job");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}
