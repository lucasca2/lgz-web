import "server-only";

import { prisma } from "@/shared/lib/prisma";

// Mapa nome→id do catálogo de etapas (semeado em etapas_catalogo). O `nome` é o
// id da coluna no board (BOARD_STAGES). Catálogo é pequeno (8 linhas).
export async function getEtapaCatalogoMap(): Promise<Map<string, string>> {
  const rows = await prisma.etapas_catalogo.findMany({
    select: { id: true, nome: true },
  });
  return new Map(rows.map((row) => [row.nome, row.id]));
}
