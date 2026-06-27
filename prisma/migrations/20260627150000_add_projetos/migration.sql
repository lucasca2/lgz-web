-- =============================================================
--  projetos — catálogo de projetos/contas (ex.: "TIM", "Sabesp").
--  Contexto opcional (preenchido manualmente).
--
--  Idempotente: seguro para rodar via `prisma db execute` num banco
--  compartilhado, sem depender do histórico de migrations.
-- =============================================================

CREATE TABLE IF NOT EXISTS projetos (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome        VARCHAR(200) NOT NULL,
    contexto    TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- nome é a chave natural do catálogo. Habilita upsert idempotente no seed.
    CONSTRAINT uq_projetos_nome UNIQUE (nome)
);

-- updated_at automático (reusa a função criada no schema v2).
DROP TRIGGER IF EXISTS trg_projetos_updated ON projetos;
CREATE TRIGGER trg_projetos_updated BEFORE UPDATE ON projetos
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
