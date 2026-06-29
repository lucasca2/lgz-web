"use client";

import { useQuery } from "@tanstack/react-query";
import { schedulingApiRoutes } from "@/domains/Scheduling/shared/constants/apiRoutes";
import type { DirectoryPerson } from "@/domains/Scheduling/shared/types";

export type DirectoryErrorCode = "RELOGIN" | "UNAVAILABLE" | "ERROR";

// Busca pessoas no diretório do Google. Habilita só com 2+ caracteres.
// Em falha, lança erro com `.code` (RELOGIN | UNAVAILABLE | ERROR) para a UI
// mostrar a mensagem certa sem quebrar a tela.
export function useDirectorySearch(query: string) {
  const q = query.trim();
  return useQuery({
    queryKey: ["scheduling", "directory", q],
    enabled: q.length >= 2,
    staleTime: 60_000,
    retry: false,
    queryFn: async (): Promise<DirectoryPerson[]> => {
      const res = await fetch(schedulingApiRoutes.directory(q));
      if (!res.ok) {
        let code: DirectoryErrorCode = "ERROR";
        try {
          const body = (await res.json()) as { code?: DirectoryErrorCode };
          if (body.code) code = body.code;
        } catch {
          // corpo não-JSON — mantém ERROR
        }
        throw Object.assign(new Error("DIRECTORY_FAILED"), {
          status: res.status,
          code,
        });
      }
      const data = (await res.json()) as { people: DirectoryPerson[] };
      return data.people;
    },
  });
}
