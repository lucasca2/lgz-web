"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRoutes } from "../../constants/apiRoutes";
import { requestJson } from "../../utils/requestJson";
import type { AssessmentDTO } from "../../types";
import type { UpdateAssessmentInput } from "../../schemas/assessmentSchemas";

type Vars = UpdateAssessmentInput & { id: string };

// Decisão manual (override) e/ou associação de posição.
export function useUpdateAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...patch }: Vars) =>
      requestJson<AssessmentDTO>(apiRoutes.byId(id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(["assessment", data.id], data);
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
    },
  });
}
