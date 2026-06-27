"use client";

import { useQuery } from "@tanstack/react-query";
import { schedulingApiRoutes } from "@/domains/Scheduling/shared/constants/apiRoutes";
import type { LinkSlotsResponse } from "@/domains/Scheduling/shared/types";

export const linkSlotsKey = (id: string) =>
  ["scheduling", "linkSlots", id] as const;

export function useLinkSlots(id: string) {
  return useQuery({
    queryKey: linkSlotsKey(id),
    queryFn: async (): Promise<LinkSlotsResponse> => {
      const res = await fetch(schedulingApiRoutes.linkSlots(id));
      if (!res.ok) {
        throw Object.assign(new Error("LINK_SLOTS_FAILED"), {
          status: res.status,
        });
      }
      return (await res.json()) as LinkSlotsResponse;
    },
    retry: false,
  });
}
