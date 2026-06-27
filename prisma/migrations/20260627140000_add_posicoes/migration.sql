-- =============================================================
--  posicoes — catálogo de cargos por senioridade
--  (ex.: nome "Backend" + nivel "Pleno" + descricao textual)
--
--  Idempotente: seguro para rodar via `prisma db execute` num banco
--  compartilhado, sem depender do histórico de migrations.
-- =============================================================

-- ENUM de senioridade. Guard p/ não falhar se já existir.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'nivel_senioridade') THEN
        CREATE TYPE nivel_senioridade AS ENUM ('Junior', 'Pleno', 'Senior', 'Especialista');
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS posicoes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome        VARCHAR(200) NOT NULL,
    nivel       nivel_senioridade NOT NULL,
    descricao   TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- catálogo: um cargo é identificado por (nome, nivel). Habilita upsert no seed.
    CONSTRAINT uq_posicoes_nome_nivel UNIQUE (nome, nivel)
);

CREATE INDEX IF NOT EXISTS idx_posicoes_nivel ON posicoes (nivel);

-- updated_at automático (reusa a função criada no schema v2).
DROP TRIGGER IF EXISTS trg_posicoes_updated ON posicoes;
CREATE TRIGGER trg_posicoes_updated BEFORE UPDATE ON posicoes
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
