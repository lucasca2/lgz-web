"use client";

import { useQuery } from "@tanstack/react-query";
import { schedulingApiRoutes } from "@/domains/Scheduling/shared/constants/apiRoutes";
import type { SlotsResponse } from "@/domains/Scheduling/shared/types";

export type SlotsArgs = {
  weekOffset: number;
  duration: number;
  urgent: boolean;
  included: string[];
  required: string[];
};

export function useSlots(args: SlotsArgs | null) {
  return useQuery({
    queryKey: ["scheduling", "slots", args],
    enabled: !!args,
    queryFn: async (): Promise<SlotsResponse> => {
      const a = args as SlotsArgs;
      const params = new URLSearchParams({
        weekOffset: String(a.weekOffset),
        duration: String(a.duration),
        urgent: a.urgent ? "true" : "false",
        included: a.included.join(","),
        required: a.required.join(","),
      });
      const res = await fetch(`${schedulingApiRoutes.slots}?${params}`);
      if (!res.ok) {
        throw Object.assign(new Error("SLOTS_FAILED"), { status: res.status });
      }
      return (await res.json()) as SlotsResponse;
    },
  });
}
