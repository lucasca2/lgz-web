"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRoutes } from "../../constants/apiRoutes";
import type {
  AssessmentListResponse,
  AssessmentStatusFilter,
} from "../../types";

export type UseAssessmentsParams = {
  page?: number;
  limit?: number;
  status?: AssessmentStatusFilter;
  search?: string;
};

export function useAssessments(params: UseAssessmentsParams = {}) {
  return useQuery({
    queryKey: ["assessments", params] as const,
    queryFn: async (): Promise<AssessmentListResponse> => {
      const sp = new URLSearchParams();
      sp.set("page", String(params.page ?? 1));
      sp.set("limit", String(params.limit ?? 20));
      if (params.status && params.status !== "all") sp.set("status", params.status);
      if (params.search) sp.set("search", params.search);

      const res = await fetch(`${apiRoutes.assessments}?${sp.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch assessments");
      return res.json();
    },
  });
}
