import "server-only";

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/shared/lib/prisma";
import { toDbStatus, vagaToJobDTO } from "../vagaMapper";
import type { JobStatus } from "../../schemas/jobSchemas";
import type { JobDTO } from "../../types";

// Retorna null quando a vaga não existe (o route handler vira isso em 404).
export async function updateJobStatus(
  id: string,
  status: JobStatus,
): Promise<JobDTO | null> {
  try {
    const row = await prisma.vagas.update({
      where: { id },
      data: { status: toDbStatus(status) },
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
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return null;
    }
    throw error;
  }
}
