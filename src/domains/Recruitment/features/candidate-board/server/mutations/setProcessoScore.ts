import "server-only";

import { prisma } from "@/shared/lib/prisma";

// Define manualmente o score de fit de um processo (0–100).
export async function setProcessoScore(
  processoId: string,
  score: number,
): Promise<{ score: number }> {
  await prisma.processos_seletivos.update({
    where: { id: processoId },
    data: { score_fit_cultural: score },
  });
  return { score };
}
