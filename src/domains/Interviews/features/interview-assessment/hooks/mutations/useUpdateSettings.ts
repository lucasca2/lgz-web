"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRoutes } from "../../constants/apiRoutes";
import { requestJson } from "../../utils/requestJson";
import { assessmentSettingsKey } from "../queries/useAssessmentSettings";
import type { AiSettingsResponse } from "../../types";
import type { SettingsInput } from "../../schemas/assessmentSchemas";

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SettingsInput) =>
      requestJson<AiSettingsResponse>(apiRoutes.settings, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(assessmentSettingsKey, data);
    },
  });
}
