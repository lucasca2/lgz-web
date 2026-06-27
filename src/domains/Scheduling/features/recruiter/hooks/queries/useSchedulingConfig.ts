"use client";

import { useQuery } from "@tanstack/react-query";
import { schedulingApiRoutes } from "@/domains/Scheduling/shared/constants/apiRoutes";
import type { SchedulingConfigResponse } from "@/domains/Scheduling/shared/types";

export function useSchedulingConfig() {
  return useQuery({
    queryKey: ["scheduling", "config"],
    queryFn: async (): Promise<SchedulingConfigResponse> => {
      const res = await fetch(schedulingApiRoutes.config);
      if (!res.ok) throw new Error("Failed to fetch scheduling config");
      return (await res.json()) as SchedulingConfigResponse;
    },
  });
}
