"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRoutes } from "../../constants/apiRoutes";
import type { JobDTO } from "../../types";

export function useJobs() {
  return useQuery({
    queryKey: ["jobs"],
    queryFn: async (): Promise<JobDTO[]> => {
      const res = await fetch(apiRoutes.jobs);
      if (!res.ok) throw new Error("Failed to fetch jobs");
      return res.json();
    },
  });
}
