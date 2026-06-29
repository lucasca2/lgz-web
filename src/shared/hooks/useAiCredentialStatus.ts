"use client";

import { useQuery } from "@tanstack/react-query";

// Indica se o usuário logado tem credencial de IA configurada (setup token ou
// API key). Compartilhado entre os pontos que disparam IA.
export function useAiCredentialStatus() {
  return useQuery({
    queryKey: ["ai-credential"],
    queryFn: async (): Promise<{ configured: boolean }> => {
      const res = await fetch("/api/ai-credential");
      if (!res.ok) throw new Error("ai_credential_failed");
      return res.json();
    },
    staleTime: 60 * 1000,
  });
}
