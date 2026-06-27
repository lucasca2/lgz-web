-- =============================================================
--  avaliacoes_entrevista — avaliação de entrevistas (IA)
--  Migrado do people-interview-assessment-agent.
--  Fluxo: transcrição → análise comportamental → recomendação → decisão.
--  Vincula-se ao catálogo de posições (posicoes) = "especialidade".
--
--  + configuracoes_avaliacao — config global (modelo + prompts), linha única.
--
--  Idempotente: seguro para rodar via `prisma db execute` num banco
--  compartilhado, sem depender do histórico de migrations.
-- =============================================================

-- ENUM da decisão final. Guard p/ não falhar se já existir.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'avaliacao_decisao') THEN
        CREATE TYPE avaliacao_decisao AS ENUM ('APROVAR', 'REPROVAR');
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS avaliacoes_entrevista (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    posicao_id           UUID,
    candidato_nome       VARCHAR(255) NOT NULL,
    cargo                VARCHAR(500),
    transcricao          TEXT NOT NULL,
    analise_json         JSONB,
    recomendacao_json    JSONB,
    decisao              avaliacao_decisao,
    justificativa_manual TEXT,
    resumo_markdown      TEXT,
    -- id do registro no app de origem — habilita upsert idempotente no seed.
    origem_id            INTEGER,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_avaliacoes_origem UNIQUE (origem_id),
    CONSTRAINT fk_avaliacoes_posicao
        FOREIGN KEY (posicao_id) REFERENCES posicoes (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_avaliacoes_posicao   ON avaliacoes_entrevista (posicao_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_candidato ON avaliacoes_entrevista (candidato_nome);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_created   ON avaliacoes_entrevista (created_at);

-- updated_at automático (reusa a função criada no schema v2).
DROP TRIGGER IF EXISTS trg_avaliacoes_updated ON avaliacoes_entrevista;
CREATE TRIGGER trg_avaliacoes_updated BEFORE UPDATE ON avaliacoes_entrevista
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- -------------------------------------------------------------
--  configuracoes_avaliacao — linha única (id = 'singleton').
--  Colunas nulas caem nos defaults definidos em código.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS configuracoes_avaliacao (
    id                        TEXT PRIMARY KEY DEFAULT 'singleton',
    model                     TEXT,
    analysis_prompt           TEXT,
    recommendation_prompt     TEXT,
    summary_prompt            TEXT,
    rejection_template_prompt TEXT,
    updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_config_avaliacao_updated ON configuracoes_avaliacao;
CREATE TRIGGER trg_config_avaliacao_updated BEFORE UPDATE ON configuracoes_avaliacao
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
