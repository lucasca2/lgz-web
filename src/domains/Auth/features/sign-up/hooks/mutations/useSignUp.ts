"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRoutes } from "@/domains/Auth/shared/constants/apiRoutes";
import { currentUserKey } from "@/domains/Auth/shared/hooks";
import type { SignupInput } from "@/domains/Auth/shared/schemas/authSchemas";
import type { CurrentUser } from "@/domains/Auth/shared/types";

export function useSignUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SignupInput): Promise<CurrentUser> => {
      const res = await fetch(apiRoutes.signup, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        throw Object.assign(new Error("SIGNUP_FAILED"), { status: res.status });
      }
      return (await res.json()) as CurrentUser;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(currentUserKey, user);
      queryClient.invalidateQueries({ queryKey: currentUserKey });
    },
  });
}
