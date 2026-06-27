"use client";

import { useMutation } from "@tanstack/react-query";
import { schedulingApiRoutes } from "@/domains/Scheduling/shared/constants/apiRoutes";
import type { CreateLinkInput } from "@/domains/Scheduling/shared/schemas";
import type { CreateLinkResponse } from "@/domains/Scheduling/shared/types";

export function useCreateLink() {
  return useMutation({
    mutationFn: async (
      input: CreateLinkInput,
    ): Promise<CreateLinkResponse> => {
      const res = await fetch(schedulingApiRoutes.links, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        throw Object.assign(new Error("CREATE_LINK_FAILED"), {
          status: res.status,
        });
      }
      return (await res.json()) as CreateLinkResponse;
    },
  });
}
