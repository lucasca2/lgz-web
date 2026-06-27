import "server-only";

import { prisma } from "@/shared/lib/prisma";
import { vagaToJobDTO } from "../vagaMapper";
import type { JobDTO } from "../../types";

// Server-only: leitura de uma vaga por id (tabela `vagas`). Mapeia p/ JobDTO.
export async function getJobById(id: string): Promise<JobDTO | null> {
  const row = await prisma.vagas.findUnique({
    where: { id },
    select: {
      id: true,
      titulo: true,
      projeto: true,
      descricao: true,
      status: true,
      data_abertura: true,
      created_at: true,
    },
  });
  return row ? vagaToJobDTO(row) : null;
}
