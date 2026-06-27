import { useQuery } from "@tanstack/react-query";
import { funilApiRoutes } from "../../constants/apiRoutes";
import type { FunilMetrics } from "../../types";

export function useFunilMetrics(projeto: string | null) {
  return useQuery<FunilMetrics>({
    queryKey: ["funil", "metrics", projeto],
    queryFn: async () => {
      const url = projeto
        ? `${funilApiRoutes.overview}?projeto=${encodeURIComponent(projeto)}`
        : funilApiRoutes.overview;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Erro ao buscar métricas do funil");
      return res.json() as Promise<FunilMetrics>;
    },
  });
}
