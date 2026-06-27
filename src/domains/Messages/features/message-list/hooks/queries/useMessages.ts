"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRoutes } from "../../constants/apiRoutes";
import type { MessageDTO } from "../../types";

export function useMessages() {
  return useQuery({
    queryKey: ["messages"],
    queryFn: async (): Promise<MessageDTO[]> => {
      const res = await fetch(apiRoutes.messages);
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
  });
}
