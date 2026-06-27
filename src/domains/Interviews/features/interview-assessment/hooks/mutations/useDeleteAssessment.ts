"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRoutes } from "../../constants/apiRoutes";
import { requestJson } from "../../utils/requestJson";

export function useDeleteAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      requestJson<{ ok: true }>(apiRoutes.byId(id), { method: "DELETE" }),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: ["assessment", id] });
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
    },
  });
}
