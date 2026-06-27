"use client";

import { useQuery } from "@tanstack/react-query";
import { linkedInApiRoutes } from "@/domains/LinkedIn/shared/constants/apiRoutes";
import type { LinkedInSearchResponse } from "@/domains/LinkedIn/shared/types";

export interface SearchCandidatesParams {
  keywords: string;
  location?: string;
  page?: number;
  network?: string;
  current_company?: string;
}

export function useSearchCandidates(
  params: SearchCandidatesParams,
  enabled = true,
) {
  return useQuery({
    queryKey: ["linkedin", "search", params] as const,
    queryFn: async (): Promise<LinkedInSearchResponse> => {
      const searchParams = new URLSearchParams({
        keywords: params.keywords,
        page: String(params.page ?? 0),
      });
      if (params.location) searchParams.set("location", params.location);
      if (params.network) searchParams.set("network", params.network);
      if (params.current_company)
        searchParams.set("current_company", params.current_company);

      const res = await fetch(
        `${linkedInApiRoutes.search}?${searchParams.toString()}`,
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw Object.assign(new Error("LinkedIn search failed"), {
          status: res.status,
          data: err,
        });
      }
      return res.json() as Promise<LinkedInSearchResponse>;
    },
    enabled: enabled && params.keywords.trim().length > 0,
    staleTime: 60_000,
  });
}
