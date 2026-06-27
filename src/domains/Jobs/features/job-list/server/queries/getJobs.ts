import "server-only";

import { prisma } from "@/shared/lib/prisma";
import { vagaToJobDTO } from "../vagaMapper";
import type { JobDTO } from "../../types";

// Server-only: leitura via Prisma (tabela `vagas`). Mapeia p/ JobDTO.
export async function getJobs(): Promise<JobDTO[]> {
  const rows = await prisma.vagas.findMany({
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      titulo: true,
      projeto: true,
      status: true,
      data_abertura: true,
      created_at: true,
    },
  });
  return rows.map(vagaToJobDTO);
}
