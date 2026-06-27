"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRoutes } from "@/domains/Auth/shared/constants/apiRoutes";
import { currentUserKey } from "@/domains/Auth/shared/hooks/queries/useCurrentUser";

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      const res = await fetch(apiRoutes.logout, { method: "POST" });
      if (!res.ok) throw new Error("Logout failed");
    },
    onSuccess: () => {
      queryClient.setQueryData(currentUserKey, null);
      queryClient.invalidateQueries({ queryKey: currentUserKey });
    },
  });
}
