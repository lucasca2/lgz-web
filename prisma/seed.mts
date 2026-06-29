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

type SeedEtapa = {
  nome: string;
  grupo?: string | null;
};

type ProcessoStatus =
  | "Em andamento"
  | "Aprovado"
  | "Reprovado"
  | "Base de Talentos";

type SeedVagaCandidato = {
  nome: string;
  linkedin_url: string;
  email?: string | null;
  telefone?: string | null;
  origem?: string | null;
  pretensao_salarial?: number | null;
  etapa: string;
  score?: number | null;
};

type SeedVagaExemplo = {
  vaga: {
    titulo: string;
    projeto: string;
    descricao?: string | null;
    status?: string | null;
    prioridade?: number | null;
    palavras_chave?: string[];
  };
  candidatos: SeedVagaCandidato[];
};

const here = dirname(fileURLToPath(import.meta.url));
const positions: SeedPosition[] = JSON.parse(
  readFileSync(join(here, "seed", "positions.json"), "utf8"),
);
const projects: SeedProject[] = JSON.parse(
  readFileSync(join(here, "seed", "projects.json"), "utf8"),
);
const etapas: SeedEtapa[] = JSON.parse(
  readFileSync(join(here, "seed", "etapas.json"), "utf8"),
);
const vagaExemplo: SeedVagaExemplo = JSON.parse(
  readFileSync(join(here, "seed", "vaga-exemplo.json"), "utf8"),
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

async function seedEtapas(pool: pg.Pool) {
  let inserted = 0;
  // Catálogo fixo de etapas do pipeline (colunas do kanban). Só garante a
  // existência dos nomes; NÃO sobrescreve.
  for (const etapa of etapas) {
    const result = await pool.query(
      `INSERT INTO etapas_catalogo (nome, grupo)
       VALUES ($1, $2)
       ON CONFLICT (nome) DO NOTHING`,
      [etapa.nome, etapa.grupo ?? null],
    );
    inserted += result.rowCount ?? 0;
  }
  console.log(
    `✅ Seed etapas_catalogo: ${inserted} inseridas, ${etapas.length - inserted} já existentes (total ${etapas.length}).`,
  );
}

// Deriva o status_atual do processo a partir da etapa do board.
function statusFromEtapa(etapa: string): ProcessoStatus {
  if (etapa === "Aprovado") return "Aprovado";
  if (etapa === "Recusado") return "Reprovado";
  return "Em andamento";
}

// Semeia 1 vaga de exemplo + seus candidatos, ligando-os via processos_seletivos
// e posicionando cada um numa etapa do board (historico_etapas). Idempotente:
// reusa a vaga/candidatos por chave natural e regrava a etapa atual.
async function seedVagaExemplo(pool: pg.Pool) {
  const { vaga, candidatos } = vagaExemplo;

  // 1. Vaga — sem unique natural; reusa por (titulo, projeto) ou cria.
  const existingVaga = await pool.query<{ id: string }>(
    `SELECT id FROM vagas WHERE titulo = $1 AND projeto = $2 LIMIT 1`,
    [vaga.titulo, vaga.projeto],
  );
  let vagaId: string;
  if (existingVaga.rows[0]) {
    vagaId = existingVaga.rows[0].id;
  } else {
    const created = await pool.query<{ id: string }>(
      `INSERT INTO vagas (titulo, projeto, descricao, status, prioridade, palavras_chave)
       VALUES ($1, $2, $3, $4::vaga_status, $5, $6)
       RETURNING id`,
      [
        vaga.titulo,
        vaga.projeto,
        vaga.descricao ?? null,
        vaga.status ?? "Aberta",
        vaga.prioridade ?? null,
        vaga.palavras_chave ?? [],
      ],
    );
    vagaId = created.rows[0].id;
  }

  // 2. Mapa nome → id das etapas do catálogo (garantidas por seedEtapas).
  const etapaRows = await pool.query<{ id: string; nome: string }>(
    `SELECT id, nome FROM etapas_catalogo`,
  );
  const etapaMap = new Map(etapaRows.rows.map((r) => [r.nome, r.id]));

  let processados = 0;
  for (const cand of candidatos) {
    // 3a. Candidato — reusa por linkedin_url (unique parcial onde deleted_at IS NULL).
    const candResult = await pool.query<{ id: string }>(
      `INSERT INTO candidatos (nome, linkedin_url, email, telefone, origem, pretensao_salarial)
       VALUES ($1, $2, $3, $4, $5::origem_candidato, $6)
       ON CONFLICT (linkedin_url) WHERE (deleted_at IS NULL)
       DO UPDATE SET nome = EXCLUDED.nome, updated_at = now()
       RETURNING id`,
      [
        cand.nome,
        cand.linkedin_url,
        cand.email ?? null,
        cand.telefone ?? null,
        cand.origem ?? null,
        cand.pretensao_salarial ?? null,
      ],
    );
    const candidatoId = candResult.rows[0].id;

    // 3b. Processo seletivo — liga candidato + vaga (unique vaga_id, candidato_id).
    const procResult = await pool.query<{ id: string }>(
      `INSERT INTO processos_seletivos (vaga_id, candidato_id, status_atual, score_fit_cultural)
       VALUES ($1, $2, $3::processo_status, $4)
       ON CONFLICT (vaga_id, candidato_id)
       DO UPDATE SET status_atual = EXCLUDED.status_atual,
                     score_fit_cultural = EXCLUDED.score_fit_cultural,
                     updated_at = now()
       RETURNING id`,
      [vagaId, candidatoId, statusFromEtapa(cand.etapa), cand.score ?? null],
    );
    const processoId = procResult.rows[0].id;

    // 3c. Etapa atual no board — regrava para manter exatamente uma por re-run.
    const etapaId = etapaMap.get(cand.etapa);
    if (!etapaId) {
      console.warn(`⚠️  Etapa "${cand.etapa}" não está no catálogo — pulando histórico.`);
    } else {
      await pool.query(`DELETE FROM historico_etapas WHERE processo_id = $1`, [
        processoId,
      ]);
      await pool.query(
        `INSERT INTO historico_etapas (processo_id, etapa_catalogo_id)
         VALUES ($1, $2)`,
        [processoId, etapaId],
      );
    }
    processados += 1;
  }

  console.log(
    `✅ Seed vaga exemplo: vaga "${vaga.titulo}" + ${processados} candidatos posicionados no board.`,
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
    await seedEtapas(pool);
    await seedVagaExemplo(pool);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error("❌ Falha no seed:", error);
  process.exit(1);
});
