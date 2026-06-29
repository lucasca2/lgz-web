-- =============================================================
--  Decision loop: liga avaliação ↔ processo, vaga ↔ posição, e
--  adiciona justificativa de transição de etapa.
--
--  Idempotente: seguro para rodar mais de uma vez num banco
--  compartilhado, sem depender do histórico de migrations.
--  Todas as colunas são nullable/aditivas (não quebram leitores).
-- =============================================================

-- vagas.posicao_id → posicoes(id) (escopo do score por IA).
ALTER TABLE "vagas" ADD COLUMN IF NOT EXISTS "posicao_id" UUID;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'vagas_posicao_id_fkey') THEN
    ALTER TABLE "vagas"
      ADD CONSTRAINT "vagas_posicao_id_fkey"
      FOREIGN KEY ("posicao_id") REFERENCES "posicoes"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION;
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS "idx_vagas_posicao" ON "vagas"("posicao_id");

-- historico_etapas.justificativa: texto da justificativa ao mover de etapa.
ALTER TABLE "historico_etapas" ADD COLUMN IF NOT EXISTS "justificativa" TEXT;

-- avaliacoes_entrevista.processo_id → processos_seletivos(id)
-- (avaliação feita a partir do card do candidato).
ALTER TABLE "avaliacoes_entrevista" ADD COLUMN IF NOT EXISTS "processo_id" UUID;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'avaliacoes_entrevista_processo_id_fkey') THEN
    ALTER TABLE "avaliacoes_entrevista"
      ADD CONSTRAINT "avaliacoes_entrevista_processo_id_fkey"
      FOREIGN KEY ("processo_id") REFERENCES "processos_seletivos"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION;
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS "idx_avaliacoes_processo" ON "avaliacoes_entrevista"("processo_id");
