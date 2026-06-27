import "dotenv/config";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

const { Pool } = pg;

// Seed do catálogo de posições. Usa `pg` direto (não o client gerado do Prisma)
// porque o client ESM gerado não resolve em um processo Node standalone.
// Rodar via `npx prisma db seed` (configurado em prisma.config.ts) ou `npm run db:seed`.

type SeedPosition = {
  name: string;
  nivel: "Junior" | "Pleno" | "Senior" | "Especialista";
  descricao: string;
};

const here = dirname(fileURLToPath(import.meta.url));
const positions: SeedPosition[] = JSON.parse(
  readFileSync(join(here, "seed", "positions.json"), "utf8"),
);

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL não definida — confira o .env.");
  }

  const pool = new Pool({ connectionString });
  let inserted = 0;
  let updated = 0;

  try {
    for (const position of positions) {
      const result = await pool.query<{ inserted: boolean }>(
        `INSERT INTO posicoes (nome, nivel, descricao)
         VALUES ($1, $2::nivel_senioridade, $3)
         ON CONFLICT (nome, nivel)
         DO UPDATE SET descricao = EXCLUDED.descricao, updated_at = now()
         RETURNING (xmax = 0) AS inserted`,
        [position.name, position.nivel, position.descricao],
      );
      if (result.rows[0]?.inserted) inserted += 1;
      else updated += 1;
    }
  } finally {
    await pool.end();
  }

  console.log(
    `✅ Seed posicoes: ${inserted} inseridas, ${updated} atualizadas (total ${positions.length}).`,
  );
}

main().catch((error) => {
  console.error("❌ Falha no seed de posicoes:", error);
  process.exit(1);
});
