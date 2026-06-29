"use client";

import { useQuery } from "@tanstack/react-query";

export type UsuarioOption = { id: string; nome: string; email: string };

// Lista usuários ativos (para o picker de hiring manager da vaga).
export function useUsuarios() {
  return useQuery({
    queryKey: ["usuarios"],
    queryFn: async (): Promise<UsuarioOption[]> => {
      const res = await fetch("/api/usuarios");
      if (!res.ok) throw new Error("Failed to load usuarios");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}
