-- =============================================================
--  usuarios — adiciona `api_key` (API key pessoal sk-ant-api…,
--  fallback quando o usuário não tem setup token).
--
--  Idempotente / aditivo / nullable: seguro no banco compartilhado.
-- =============================================================

ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "api_key" TEXT;
