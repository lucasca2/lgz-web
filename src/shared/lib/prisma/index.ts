import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Prisma 7 exige um driver adapter; para PostgreSQL usamos @prisma/adapter-pg.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// Singleton: evita abrir uma conexão nova a cada hot-reload em desenvolvimento.
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
