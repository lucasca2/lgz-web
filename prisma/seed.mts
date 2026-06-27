import "dotenv/config";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

const { Pool } = pg;

// Seed dos catálogos (posições e projetos) + avaliações de entrevista. Usa `pg`
// direto (não o client gerado do Prisma) porque o client ESM gerado não resolve
// em um processo Node standalone.
// Rodar via `npx prisma db seed` (configurado em prisma.config.ts) ou `npm run db:seed`.

type Nivel = "Junior" | "Pleno" | "Senior" | "Especialista";

type SeedPosition = {
  name: string;
  nivel: Nivel;
  descricao: string;
};

type SeedProject = {
  name: string;
  contexto?: string | null;
};

// Formato do export do app de origem (people-interview-assessment-agent):
// resposta de GET /api/interviews. Basta colar o export completo em
// `seed/source-interviews.json` para popular TODAS as entrevistas.
type SourceInterview = {
  id: number;
  candidate_name: string;
  position: string | null;
  transcript: string;
  analysis_json: unknown;
  recommendation_json: unknown;
  final_status: "APROVAR" | "REPROVAR" | null;
  summary_markdown: string | null;
  job_position_id: number | null;
};

const here = dirname(fileURLToPath(import.meta.url));
const positions: SeedPosition[] = JSON.parse(
  readFileSync(join(here, "seed", "positions.json"), "utf8"),
);
const projects: SeedProject[] = JSON.parse(
  readFileSync(join(here, "seed", "projects.json"), "utf8"),
);

function readSourceInterviews(): SourceInterview[] {
  try {
    const raw = JSON.parse(
      readFileSync(join(here, "seed", "source-interviews.json"), "utf8"),
    );
    // Aceita tanto { interviews: [...] } (export bruto) quanto [...] direto.
    return Array.isArray(raw) ? raw : (raw.interviews ?? []);
  } catch {
    return [];
  }
}

// ── Derivação da especialidade (posição) a partir do dado de origem ──

// job_position_id do app de origem → área do catálogo de posições.
const AREA_BY_JOB: Record<number, string> = {
  3: "QA",
  4: "Produto",
  5: "Frontend",
  12: "Sustentação",
};

function areaFromInterview(it: SourceInterview): string {
  if (it.job_position_id && AREA_BY_JOB[it.job_position_id]) {
    return AREA_BY_JOB[it.job_position_id];
  }
  const p = (it.position ?? "").toLowerCase();
  if (/react native/.test(p)) return "React Native";
  if (/android/.test(p)) return "Android";
  if (/\bios\b/.test(p)) return "iOS";
  if (/front/.test(p)) return "Frontend";
  if (/back/.test(p)) return "Backend";
  if (/\bqa\b|quality|qualidade|teste/.test(p)) return "QA";
  if (/sustenta|suporte/.test(p)) return "Sustentação";
  if (/design/.test(p)) return "Design";
  if (/product|\bpo\b|\bpm\b|scrum|gerente de projeto|business analyst|analista (de neg|funcional)/.test(p))
    return "Produto";
  return "Frontend";
}

function nivelFromInterview(it: SourceInterview): Nivel {
  const p = (it.position ?? "").toLowerCase();
  if (/especialista/.test(p)) return "Especialista";
  if (/s[eê]nior|\bsr\b/.test(p)) return "Senior";
  if (/j[uú]nior|\bjr\b|trainee|est[aá]gi/.test(p)) return "Junior";
  return "Pleno";
}

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

// Garante a posição (área + nível) e retorna seu id. NÃO sobrescreve a descrição
// de posições já cadastradas (apenas cria a posição se faltar).
async function ensurePosicao(
  pool: pg.Pool,
  area: string,
  nivel: Nivel,
): Promise<string> {
  const result = await pool.query<{ id: string }>(
    `INSERT INTO posicoes (nome, nivel, descricao)
     VALUES ($1, $2::nivel_senioridade, $3)
     ON CONFLICT (nome, nivel) DO UPDATE SET nome = EXCLUDED.nome
     RETURNING id`,
    [area, nivel, `Posição ${area} — nível ${nivel}.`],
  );
  return result.rows[0].id;
}

async function seedAssessments(pool: pg.Pool) {
  const interviews = readSourceInterviews();
  if (interviews.length === 0) {
    console.log(
      "ℹ️  Seed avaliações: seed/source-interviews.json vazio/ausente — pulando.",
    );
    return;
  }

  let inserted = 0;
  let updated = 0;
  for (const it of interviews) {
    const area = areaFromInterview(it);
    const nivel = nivelFromInterview(it);
    const posicaoId = await ensurePosicao(pool, area, nivel);

    const result = await pool.query<{ inserted: boolean }>(
      `INSERT INTO avaliacoes_entrevista
         (posicao_id, candidato_nome, cargo, transcricao, analise_json,
          recomendacao_json, decisao, resumo_markdown, origem_id)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7::avaliacao_decisao, $8, $9)
       ON CONFLICT (origem_id) DO UPDATE SET
         posicao_id = EXCLUDED.posicao_id,
         candidato_nome = EXCLUDED.candidato_nome,
         cargo = EXCLUDED.cargo,
         transcricao = EXCLUDED.transcricao,
         analise_json = EXCLUDED.analise_json,
         recomendacao_json = EXCLUDED.recomendacao_json,
         decisao = EXCLUDED.decisao,
         resumo_markdown = EXCLUDED.resumo_markdown,
         updated_at = now()
       RETURNING (xmax = 0) AS inserted`,
      [
        posicaoId,
        it.candidate_name,
        it.position ?? null,
        it.transcript ?? "",
        JSON.stringify(it.analysis_json ?? null),
        JSON.stringify(it.recommendation_json ?? null),
        it.final_status ?? null,
        it.summary_markdown ?? null,
        it.id,
      ],
    );
    if (result.rows[0]?.inserted) inserted += 1;
    else updated += 1;
  }
  console.log(
    `✅ Seed avaliações: ${inserted} inseridas, ${updated} atualizadas (total ${interviews.length}).`,
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
    await seedAssessments(pool);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error("❌ Falha no seed:", error);
  process.exit(1);
});
