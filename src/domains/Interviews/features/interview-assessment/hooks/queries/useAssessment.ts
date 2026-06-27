"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRoutes } from "../../constants/apiRoutes";
import type { AssessmentDTO } from "../../types";

export function useAssessment(id: string | null | undefined) {
  return useQuery({
    queryKey: ["assessment", id] as const,
    enabled: Boolean(id),
    queryFn: async (): Promise<AssessmentDTO> => {
      const res = await fetch(apiRoutes.byId(id as string));
      if (!res.ok) throw new Error("Failed to fetch assessment");
      return res.json();
    },
  });
}
