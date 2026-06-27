"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { schedulingApiRoutes } from "@/domains/Scheduling/shared/constants/apiRoutes";
import type { BookInput } from "@/domains/Scheduling/shared/schemas";
import type { BookResponse } from "@/domains/Scheduling/shared/types";
import { linkSlotsKey } from "../queries/useLinkSlots";

export function useBookSlot(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: BookInput): Promise<BookResponse> => {
      const res = await fetch(schedulingApiRoutes.book(id), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        throw Object.assign(new Error("BOOK_FAILED"), { status: res.status });
      }
      return (await res.json()) as BookResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: linkSlotsKey(id) });
    },
  });
}
