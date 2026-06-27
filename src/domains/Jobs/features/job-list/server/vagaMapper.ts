import "server-only";

import type { JobDTO } from "../types";
import type { JobStatus } from "../schemas/jobSchemas";

// O enum do banco usa "Stand_by" (mapeado p/ "Stand-by" no Postgres);
// o DTO/UI usa "Stand-by". Convertemos nas duas pontas aqui.
type DbStatus = "Aberta" | "Stand_by" | "Fechada" | "Cancelada";

const statusFromDb: Record<DbStatus, JobStatus> = {
  Aberta: "Aberta",
  Stand_by: "Stand-by",
  Fechada: "Fechada",
  Cancelada: "Cancelada",
};

const statusToDb: Record<JobStatus, DbStatus> = {
  Aberta: "Aberta",
  "Stand-by": "Stand_by",
  Fechada: "Fechada",
  Cancelada: "Cancelada",
};

export function toDbStatus(status: JobStatus): DbStatus {
  return statusToDb[status];
}

type VagaRow = {
  id: string;
  titulo: string;
  projeto: string;
  status: DbStatus;
  data_abertura: Date;
  created_at: Date;
};

export function vagaToJobDTO(row: VagaRow): JobDTO {
  return {
    id: row.id,
    title: row.titulo,
    project: row.projeto,
    status: statusFromDb[row.status],
    openedAt: row.data_abertura.toISOString(),
    createdAt: row.created_at.toISOString(),
  };
}
