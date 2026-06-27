import { useQuery } from "@tanstack/react-query";
import { funilApiRoutes } from "../../constants/apiRoutes";
import type { FunilMetrics } from "../../types";

export function useFunilMetrics() {
  return useQuery<FunilMetrics>({
    queryKey: ["funil", "metrics"],
    queryFn: async () => {
      const res = await fetch(funilApiRoutes.overview);
      if (!res.ok) throw new Error("Erro ao buscar métricas do funil");
      return res.json() as Promise<FunilMetrics>;
    },
  });
}
