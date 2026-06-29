-- Recomendação de participantes por posição: guarda a posição (normalizada em
-- minúsculas) de cada convite para sugerir os mesmos participantes em futuras
-- entrevistas da mesma posição.
ALTER TABLE "convites_agendamento" ADD COLUMN "posicao" VARCHAR(255);

CREATE INDEX "idx_convites_posicao" ON "convites_agendamento"("posicao");
