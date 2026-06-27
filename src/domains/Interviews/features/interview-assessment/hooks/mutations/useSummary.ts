"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRoutes } from "../../constants/apiRoutes";
import { requestJson } from "../../utils/requestJson";
import type { AssessmentDTO } from "../../types";

export function useSummary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      requestJson<AssessmentDTO>(apiRoutes.summary(id), { method: "POST" }),
    onSuccess: (data) => {
      queryClient.setQueryData(["assessment", data.id], data);
    },
  });
}
