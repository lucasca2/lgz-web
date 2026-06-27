-- =============================================================
--  Plataforma de Recrutamento "Wave" — Schema v2
--  PostgreSQL 13+
--
--  Mudanças desta versão (vs. v1 conceitual):
--   - dedup por linkedin_url (chave natural), e-mail vira opcional
--   - nova tabela `usuarios` como fonte única de colaboradores
--   - etapas canônicas (`etapas_catalogo`) p/ métrica consistente
--   - workflow configurável por vaga (`vaga_etapas`)
--   - banca de entrevista com flag obrigatório/opcional
--   - slots pré-calculados + link agnóstico p/ o candidato
--   - rastreio de custo de IA (tokens) por processo
--   - soft-delete p/ caminho de erasure (LGPD)
--   - status padronizados via ENUM / lookup
-- =============================================================

-- gen_random_uuid() é nativo no PG13+. Em versões antigas, habilite:
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================
--  ENUMs — estados controlados pelo sistema (rígidos p/ métrica)
-- =============================================================
CREATE TYPE vaga_status        AS ENUM ('Aberta', 'Stand-by', 'Fechada', 'Cancelada');
CREATE TYPE processo_status    AS ENUM ('Em andamento', 'Aprovado', 'Reprovado', 'Base de Talentos');
CREATE TYPE etapa_status       AS ENUM ('Em Andamento', 'Executada', 'Pulada', 'N/A');
CREATE TYPE entrevista_status  AS ENUM ('Aguardando_Escolha', 'Confirmada', 'Cancelada', 'Realizada');
CREATE TYPE participacao_tipo  AS ENUM ('Obrigatorio', 'Opcional');
CREATE TYPE convite_status     AS ENUM ('Sugerido', 'Confirmado', 'Cancelado');
CREATE TYPE origem_candidato   AS ENUM ('Hunting', 'Gupy', 'Indicacao', 'LinkedIn', 'Outro');

-- =============================================================
--  Função utilitária para updated_at
-- =============================================================
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================
--  usuarios — colaboradores internos (hiring managers, banca)
--  Fonte única de identidade. Sem isso, "marquinhos@..." vira
--  string solta e quebra o cruzamento de agendas.
-- =============================================================
CREATE TABLE usuarios (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome        VARCHAR(255) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,   -- e-mail do Google Workspace (chave p/ Calendar)
    ativo       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_usuarios_updated BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================
--  vagas
-- =============================================================
CREATE TABLE vagas (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo             VARCHAR(255) NOT NULL,
    projeto            VARCHAR(255) NOT NULL,
    status             vaga_status NOT NULL DEFAULT 'Aberta',
    prioridade         SMALLINT,                 -- 1 (alta) .. N
    hiring_manager_id  UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    budget             NUMERIC(12,2),
    data_abertura      DATE NOT NULL DEFAULT CURRENT_DATE,  -- início do SLA global
    data_fechamento    DATE,                                -- fim do SLA global
    -- Contexto p/ IA (os "26 campos" do formulário, em estrutura consultável)
    contexto_projeto   JSONB,
    perfil_ideal       TEXT,                     -- soft/hard skills que funcionam
    perfil_rejeitado   TEXT,                     -- o que NÃO funciona no time
    criterios_teste    TEXT,                     -- parâmetros do desafio técnico
    -- Sourcing
    prompt_analise     TEXT,                     -- prompt de fit p/ o LLM
    palavras_chave     TEXT[],                   -- keywords p/ pré-filtro determinístico (barato, antes do LLM)
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_vagas_updated BEFORE UPDATE ON vagas
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================
--  etapas_catalogo — etapas canônicas
--  Garante que "Técnico" / "Tecnica" / "Entrevista Técnica" não
--  virem 3 colunas no Kanban e não quebrem GROUP BY de métrica.
-- =============================================================
CREATE TABLE etapas_catalogo (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome        VARCHAR(100) NOT NULL UNIQUE,   -- Triagem, People, Tecnico, Teste, Cultural
    grupo       VARCHAR(100),                   -- agrupamento opcional p/ visão de Kanban
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================
--  vaga_etapas — workflow configurável por vaga
--  Atende "não-linear / não hardcode a ordem". A ordem aqui é
--  sugerida; o que de fato aconteceu fica em historico_etapas.
-- =============================================================
CREATE TABLE vaga_etapas (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vaga_id            UUID NOT NULL REFERENCES vagas(id) ON DELETE CASCADE,
    etapa_catalogo_id  UUID NOT NULL REFERENCES etapas_catalogo(id),
    ordem_sugerida     SMALLINT NOT NULL,
    obrigatoria        BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (vaga_id, etapa_catalogo_id)
);

-- =============================================================
--  candidatos
--  linkedin_url é a chave natural de dedup (sourcing raramente
--  tem e-mail no 1º contato). E-mail é único só quando existe.
-- =============================================================
CREATE TABLE candidatos (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome                VARCHAR(255) NOT NULL,
    linkedin_url        VARCHAR(512) NOT NULL,
    email               VARCHAR(255),            -- coletado depois (Calendly)
    telefone            VARCHAR(50),
    origem              origem_candidato,        -- "Indicacao" pode ter peso no score
    pretensao_salarial  NUMERIC(12,2),
    dados_extraidos     JSONB,                   -- payload ENXUTO do scraping p/ o LLM (minimize PII)
    deleted_at          TIMESTAMPTZ,             -- soft-delete; p/ erasure real, anonimizar PII
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Dedup só entre candidatos ativos: permite re-cadastrar após remoção
CREATE UNIQUE INDEX uq_candidatos_linkedin ON candidatos(linkedin_url) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX uq_candidatos_email    ON candidatos(email)        WHERE email IS NOT NULL AND deleted_at IS NULL;
CREATE TRIGGER trg_candidatos_updated BEFORE UPDATE ON candidatos
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================
--  motivos_reprovacao — lookup gerenciável pela recrutadora
--  (mais flexível que ENUM p/ algo que muda com o tempo)
-- =============================================================
CREATE TABLE motivos_reprovacao (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    descricao  VARCHAR(255) NOT NULL UNIQUE,
    ativo      BOOLEAN NOT NULL DEFAULT TRUE
);

-- =============================================================
--  processos_seletivos — pipeline (junção vaga <-> candidato)
-- =============================================================
CREATE TABLE processos_seletivos (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vaga_id                UUID NOT NULL REFERENCES vagas(id) ON DELETE CASCADE,
    candidato_id           UUID NOT NULL REFERENCES candidatos(id) ON DELETE CASCADE,
    status_atual           processo_status NOT NULL DEFAULT 'Em andamento',
    score_fit_cultural     SMALLINT CHECK (score_fit_cultural BETWEEN 0 AND 100),
    justificativa_fit      TEXT,                 -- output estruturado da IA
    motivo_reprovacao_id   UUID REFERENCES motivos_reprovacao(id),
    comentario_reprovacao  TEXT,
    devolutiva_enviada     BOOLEAN NOT NULL DEFAULT FALSE,
    -- Custo-benefício: rastreio de consumo de IA p/ fechar a conta "automação < humano"
    tokens_consumidos      INTEGER NOT NULL DEFAULT 0,
    custo_estimado_usd     NUMERIC(10,4) NOT NULL DEFAULT 0,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (vaga_id, candidato_id)              -- 1 processo por par vaga/candidato
);
CREATE TRIGGER trg_processos_updated BEFORE UPDATE ON processos_seletivos
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================
--  historico_etapas — event log (1 linha = 1 etapa realizada/pulada)
--  Calcula SLA preciso. Referencia a etapa canônica p/ agregação.
-- =============================================================
CREATE TABLE historico_etapas (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    processo_id        UUID NOT NULL REFERENCES processos_seletivos(id) ON DELETE CASCADE,
    etapa_catalogo_id  UUID NOT NULL REFERENCES etapas_catalogo(id),
    status_etapa       etapa_status NOT NULL DEFAULT 'Em Andamento',
    data_inicio        TIMESTAMPTZ NOT NULL DEFAULT now(),
    data_fim           TIMESTAMPTZ,
    tempo_pausado_seg  INTEGER NOT NULL DEFAULT 0,   -- "botão Pause": tempo travado aguardando candidato/agenda
    transcricao_url    VARCHAR(512),
    insight_ia         TEXT,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- SLA líquido da etapa = (data_fim - data_inicio) - tempo_pausado_seg

-- =============================================================
--  entrevistas — instância de entrevista vinculada a uma etapa
--  link_token = link AGNÓSTICO: candidato escolhe slot sem ver a banca
-- =============================================================
CREATE TABLE entrevistas (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    processo_id         UUID NOT NULL REFERENCES processos_seletivos(id) ON DELETE CASCADE,
    etapa_historico_id  UUID REFERENCES historico_etapas(id) ON DELETE SET NULL,
    status              entrevista_status NOT NULL DEFAULT 'Aguardando_Escolha',
    link_token          UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,  -- p/ a URL pública única
    link_expira_em      TIMESTAMPTZ,
    -- Preenchidos quando o candidato confirma um slot:
    data_hora_inicio    TIMESTAMPTZ,
    data_hora_fim       TIMESTAMPTZ,
    google_event_id     VARCHAR(255),           -- sincronização com Google Calendar
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_entrevistas_updated BEFORE UPDATE ON entrevistas
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================
--  entrevista_participantes — a banca
--  tipo_participacao alimenta o algoritmo de fallback de agenda.
-- =============================================================
CREATE TABLE entrevista_participantes (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entrevista_id      UUID NOT NULL REFERENCES entrevistas(id) ON DELETE CASCADE,
    usuario_id         UUID NOT NULL REFERENCES usuarios(id),
    tipo_participacao  participacao_tipo NOT NULL DEFAULT 'Obrigatorio',
    status_convite     convite_status NOT NULL DEFAULT 'Sugerido',
    UNIQUE (entrevista_id, usuario_id)
);

-- =============================================================
--  entrevista_slots — horários pré-calculados (determinístico, não LLM)
--  nivel_prioridade: 1 = todos livres | 2 = só obrigatórios (fallback)
--  Vários slots ficam 'Sugeridos'; o que o candidato escolher vira escolhido.
-- =============================================================
CREATE TABLE entrevista_slots (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entrevista_id     UUID NOT NULL REFERENCES entrevistas(id) ON DELETE CASCADE,
    data_hora_inicio  TIMESTAMPTZ NOT NULL,
    data_hora_fim     TIMESTAMPTZ NOT NULL,
    nivel_prioridade  SMALLINT NOT NULL DEFAULT 1,
    escolhido         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (data_hora_fim > data_hora_inicio)
);
-- No máximo 1 slot escolhido por entrevista:
CREATE UNIQUE INDEX uq_slot_escolhido ON entrevista_slots(entrevista_id) WHERE escolhido;

-- =============================================================
--  Índices de apoio (FKs e caminhos de consulta comuns)
-- =============================================================
CREATE INDEX idx_vagas_status            ON vagas(status);
CREATE INDEX idx_vaga_etapas_vaga        ON vaga_etapas(vaga_id);
CREATE INDEX idx_processos_vaga          ON processos_seletivos(vaga_id);
CREATE INDEX idx_processos_candidato     ON processos_seletivos(candidato_id);
CREATE INDEX idx_processos_status        ON processos_seletivos(status_atual);
CREATE INDEX idx_historico_processo      ON historico_etapas(processo_id);
CREATE INDEX idx_historico_etapa         ON historico_etapas(etapa_catalogo_id);
CREATE INDEX idx_entrevistas_processo    ON entrevistas(processo_id);
CREATE INDEX idx_participantes_entrevista ON entrevista_participantes(entrevista_id);
CREATE INDEX idx_slots_entrevista        ON entrevista_slots(entrevista_id);
