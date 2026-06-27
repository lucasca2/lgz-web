ALTER TABLE "usuarios" ADD COLUMN "senha_hash" TEXT;

CREATE TABLE "sessoes" (
    "id" TEXT NOT NULL,
    "usuario_id" UUID NOT NULL,
    "expira_em" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT "sessoes_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "sessoes_usuario_id_idx" ON "sessoes"("usuario_id");

ALTER TABLE "sessoes" ADD CONSTRAINT "sessoes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
