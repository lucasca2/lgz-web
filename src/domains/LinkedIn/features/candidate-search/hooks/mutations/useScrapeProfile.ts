"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { linkedInApiRoutes } from "@/domains/LinkedIn/shared/constants/apiRoutes";
import type { LinkedInProfileResponse } from "@/domains/LinkedIn/shared/types";

export function useScrapeProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (username: string): Promise<LinkedInProfileResponse> => {
      const res = await fetch(linkedInApiRoutes.profile(username));
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw Object.assign(new Error("Profile scrape failed"), {
          status: res.status,
          data: err,
        });
      }
      return res.json() as Promise<LinkedInProfileResponse>;
    },
    onSuccess: (data, username) => {
      // Cache the result so it can be read synchronously with getQueryData
      queryClient.setQueryData(["linkedin", "profile", username], data);
    },
  });
}
