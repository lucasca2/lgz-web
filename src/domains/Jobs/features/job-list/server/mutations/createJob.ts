import "server-only";

import { prisma } from "@/shared/lib/prisma";
import { toDbStatus, vagaToJobDTO } from "../vagaMapper";
import type { CreateJobInput } from "../../schemas/jobSchemas";
import type { JobDTO } from "../../types";

export async function createJob(input: CreateJobInput): Promise<JobDTO> {
  // `data_abertura` tem default CURRENT_DATE no banco; não precisamos enviar.
  const row = await prisma.vagas.create({
    data: {
      titulo: input.title,
      projeto: input.project,
      descricao: input.description ?? null,
      status: toDbStatus(input.status),
      palavras_chave: [],
    },
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
  return vagaToJobDTO(row);
}
