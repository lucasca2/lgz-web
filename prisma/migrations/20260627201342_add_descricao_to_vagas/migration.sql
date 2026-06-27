-- =============================================================
--  vagas — adiciona `descricao` (texto livre, opcional/nullable).
--
--  Idempotente: seguro para rodar mais de uma vez num banco
--  compartilhado, sem depender do histórico de migrations.
-- =============================================================

ALTER TABLE "vagas" ADD COLUMN IF NOT EXISTS "descricao" TEXT;
