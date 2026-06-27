"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRoutes } from "../../constants/apiRoutes";
import { requestJson } from "../../utils/requestJson";
import type { AssessmentDTO } from "../../types";
import type { AnalyzeInput } from "../../schemas/assessmentSchemas";

export function useAnalyze() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AnalyzeInput) =>
      requestJson<AssessmentDTO>(apiRoutes.analyze, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(["assessment", data.id], data);
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
    },
  });
}
