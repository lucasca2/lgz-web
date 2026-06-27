import "dotenv/config";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

const { Pool } = pg;

// Seed dos catálogos (posições e projetos). Usa `pg` direto (não o client gerado
// do Prisma) porque o client ESM gerado não resolve em um processo Node standalone.
// Rodar via `npx prisma db seed` (configurado em prisma.config.ts) ou `npm run db:seed`.

type SeedPosition = {
  name: string;
  nivel: "Junior" | "Pleno" | "Senior" | "Especialista";
  descricao: string;
};

type SeedProject = {
  name: string;
  contexto?: string | null;
};

const here = dirname(fileURLToPath(import.meta.url));
const positions: SeedPosition[] = JSON.parse(
  readFileSync(join(here, "seed", "positions.json"), "utf8"),
);
const projects: SeedProject[] = JSON.parse(
  readFileSync(join(here, "seed", "projects.json"), "utf8"),
);

async function seedPositions(pool: pg.Pool) {
  let inserted = 0;
  let updated = 0;
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
  console.log(
    `✅ Seed posicoes: ${inserted} inseridas, ${updated} já existentes (total ${positions.length}).`,
  );
}

async function seedProjects(pool: pg.Pool) {
  let inserted = 0;
  // Só garante a existência dos nomes; NÃO sobrescreve contexto preenchido à mão.
  for (const project of projects) {
    const result = await pool.query(
      `INSERT INTO projetos (nome, contexto)
       VALUES ($1, $2)
       ON CONFLICT (nome) DO NOTHING`,
      [project.name, project.contexto ?? null],
    );
    inserted += result.rowCount ?? 0;
  }
  console.log(
    `✅ Seed projetos: ${inserted} inseridos, ${projects.length - inserted} já existentes (total ${projects.length}).`,
  );
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL não definida — confira o .env.");
  }

  const pool = new Pool({ connectionString });
  try {
    await seedPositions(pool);
    await seedProjects(pool);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error("❌ Falha no seed:", error);
  process.exit(1);
});
