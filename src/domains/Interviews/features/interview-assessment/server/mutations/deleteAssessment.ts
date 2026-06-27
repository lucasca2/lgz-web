import "server-only";

import { prisma } from "@/shared/lib/prisma";

export async function deleteAssessment(id: string): Promise<boolean> {
  const result = await prisma.avaliacoes_entrevista.deleteMany({
    where: { id },
  });
  return result.count > 0;
}
