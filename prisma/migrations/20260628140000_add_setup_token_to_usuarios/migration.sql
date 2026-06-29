-- =============================================================
--  usuarios — adiciona `setup_token` (token OAuth pessoal do
--  `claude setup-token`; cada usuário usa a própria assinatura).
--
--  Idempotente / aditivo / nullable: seguro no banco compartilhado.
--  (A coluna setup_token de configuracoes_avaliacao deixou de ser usada —
--   o token passou a ser por-usuário.)
-- =============================================================

ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "setup_token" TEXT;
