"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { linkedInApiRoutes } from "@/domains/LinkedIn/shared/constants/apiRoutes";
import { linkedInAuthStatusKey } from "@/domains/LinkedIn/shared/hooks/queries/useLinkedInAuthStatus";
import type { LinkedInLoginResponse } from "@/domains/LinkedIn/shared/types";

export function useLinkedInLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<LinkedInLoginResponse> => {
      const res = await fetch(linkedInApiRoutes.authLogin, { method: "POST" });
      if (!res.ok) throw new Error("Failed to trigger LinkedIn login");
      return res.json() as Promise<LinkedInLoginResponse>;
    },
    onSuccess: () => {
      // Invalidate so useLinkedInAuthStatus refetches and starts polling
      queryClient.invalidateQueries({ queryKey: linkedInAuthStatusKey });
    },
  });
}
