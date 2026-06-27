"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRoutes } from "../../constants/apiRoutes";
import type { ProjectDTO } from "../../types";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async (): Promise<ProjectDTO[]> => {
      const res = await fetch(apiRoutes.projects);
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json();
    },
  });
}
