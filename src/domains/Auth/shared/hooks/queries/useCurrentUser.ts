"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRoutes } from "@/domains/Auth/shared/constants/apiRoutes";
import type { CurrentUser } from "@/domains/Auth/shared/types";

export const currentUserKey = ["auth", "currentUser"] as const;

export function useCurrentUser() {
  return useQuery({
    queryKey: currentUserKey,
    queryFn: async (): Promise<CurrentUser | null> => {
      const res = await fetch(apiRoutes.me);
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch current user");
      return res.json();
    },
  });
}
