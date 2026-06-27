"use client";

import { useQuery } from "@tanstack/react-query";
import { linkedInApiRoutes } from "@/domains/LinkedIn/shared/constants/apiRoutes";
import type { LinkedInAuthStatusResponse } from "@/domains/LinkedIn/shared/types";

export const linkedInAuthStatusKey = ["linkedin", "auth", "status"] as const;

export function useLinkedInAuthStatus() {
  return useQuery({
    queryKey: linkedInAuthStatusKey,
    queryFn: async (): Promise<LinkedInAuthStatusResponse> => {
      const res = await fetch(linkedInApiRoutes.authStatus);
      if (!res.ok) throw new Error("Failed to check LinkedIn auth status");
      return res.json() as Promise<LinkedInAuthStatusResponse>;
    },
    // Auto-poll every 5 s while a login is in progress so the UI updates
    // as soon as the user completes login in the browser window.
    refetchInterval: (query) =>
      query.state.data?.status === "login_in_progress" ? 5000 : false,
    staleTime: 10_000,
  });
}
