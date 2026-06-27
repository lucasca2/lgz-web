"use client";

import { useMutation } from "@tanstack/react-query";
import { apiRoutes } from "../../constants/apiRoutes";
import { requestJson } from "../../utils/requestJson";
import type { RejectionTemplateResponse } from "../../types";

export function useRejectionTemplate() {
  return useMutation({
    mutationFn: (id: string) =>
      requestJson<RejectionTemplateResponse>(apiRoutes.rejectionTemplate(id), {
        method: "POST",
      }),
  });
}
