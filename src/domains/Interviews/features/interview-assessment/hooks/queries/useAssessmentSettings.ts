"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRoutes } from "../../constants/apiRoutes";
import type { AiSettingsResponse } from "../../types";

export const assessmentSettingsKey = ["assessment-settings"] as const;

export function useAssessmentSettings() {
  return useQuery({
    queryKey: assessmentSettingsKey,
    queryFn: async (): Promise<AiSettingsResponse> => {
      const res = await fetch(apiRoutes.settings);
      if (!res.ok) throw new Error("Failed to fetch settings");
      return res.json();
    },
  });
}
