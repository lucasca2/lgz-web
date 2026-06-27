import "server-only";

import { prisma } from "@/shared/lib/prisma";

// Server-only: regra de negócio + acesso ao banco via Prisma.
// Chamada tanto pelo route handler quanto por Server Components.
export function getMessages() {
  return prisma.message.findMany({
    orderBy: { createdAt: "desc" },
  });
}
