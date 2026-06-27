-- Aditivo + idempotente: vincula convite ao candidato do board e guarda o link do Meet.
ALTER TABLE "convites_agendamento"
  ADD COLUMN IF NOT EXISTS "candidato_ref" VARCHAR(64),
  ADD COLUMN IF NOT EXISTS "google_meet_link" TEXT;

CREATE INDEX IF NOT EXISTS "idx_convites_candidato_ref"
  ON "convites_agendamento" ("candidato_ref");
