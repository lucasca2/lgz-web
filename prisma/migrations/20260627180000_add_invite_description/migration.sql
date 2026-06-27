-- Aditivo + idempotente: descrição do evento digitada pelo recrutador.
ALTER TABLE "convites_agendamento"
  ADD COLUMN IF NOT EXISTS "descricao" TEXT;
