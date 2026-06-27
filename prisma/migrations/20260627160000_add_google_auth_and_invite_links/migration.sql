-- Migration ADITIVA e IDEMPOTENTE (segura para aplicar num banco compartilhado).
-- Adiciona o perfil Google em `usuarios` e a tabela standalone de convites de
-- agendamento. Nada é removido ou alterado de forma destrutiva.

-- ── usuarios: perfil Google ──
ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "google_id" VARCHAR(255);
ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "picture" VARCHAR(1024);
ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "google_refresh_token" TEXT;
ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "google_scope" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "uq_usuarios_google_id" ON "usuarios"("google_id");

-- ── convites_agendamento: link de convite single-use ──
CREATE TABLE IF NOT EXISTS "convites_agendamento" (
    "id" VARCHAR(32) NOT NULL,
    "organizador_id" UUID NOT NULL,
    "organizador_email" VARCHAR(255) NOT NULL,
    "titulo" VARCHAR(255) NOT NULL,
    "duracao_min" SMALLINT NOT NULL,
    "urgente" BOOLEAN NOT NULL DEFAULT false,
    "incluidos" JSONB NOT NULL,
    "obrigatorios" JSONB NOT NULL,
    "slots" JSONB NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "consumido_em" TIMESTAMPTZ(6),
    "consumido_por_email" VARCHAR(255),
    "slot_agendado" TEXT,
    "google_event_id" VARCHAR(255),
    "google_event_link" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "convites_agendamento_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "idx_convites_organizador" ON "convites_agendamento"("organizador_id");

-- FK guardada: só cria se ainda não existir.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'convites_agendamento_organizador_id_fkey'
  ) THEN
    ALTER TABLE "convites_agendamento"
      ADD CONSTRAINT "convites_agendamento_organizador_id_fkey"
      FOREIGN KEY ("organizador_id") REFERENCES "usuarios"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION;
  END IF;
END $$;
