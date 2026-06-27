import { useQuery } from "@tanstack/react-query";
import { candidatosApiRoutes } from "../../constants/apiRoutes";
import type { CandidatoFilters, CandidatosResponse } from "../../types";

export function useCandidatos(filters: CandidatoFilters) {
  return useQuery<CandidatosResponse>({
    queryKey: ["candidatos", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.q) params.set("q", filters.q);
      if (filters.origem) params.set("origem", filters.origem);
      params.set("page", String(filters.page));
      params.set("pageSize", String(filters.pageSize));

      const res = await fetch(`${candidatosApiRoutes.list}?${params}`);
      if (!res.ok) throw new Error("Erro ao buscar candidatos");
      return res.json() as Promise<CandidatosResponse>;
    },
  });
}
