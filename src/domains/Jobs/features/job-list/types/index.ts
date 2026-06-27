import type { JobStatus } from "../schemas/jobSchemas";

// DTO trafegado via HTTP — datas chegam como string (JSON) ao cliente.
export type JobDTO = {
  id: string;
  title: string;
  project: string;
  status: JobStatus;
  openedAt: string;
  createdAt: string;
};
