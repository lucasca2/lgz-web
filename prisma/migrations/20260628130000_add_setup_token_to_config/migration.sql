-- =============================================================
--  configuracoes_avaliacao — adiciona `setup_token` (token OAuth do
--  `claude setup-token`, alternativa à ANTHROPIC_API_KEY).
--
--  Idempotente / aditivo / nullable: seguro no banco compartilhado.
-- =============================================================

ALTER TABLE "configuracoes_avaliacao" ADD COLUMN IF NOT EXISTS "setup_token" TEXT;
