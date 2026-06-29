// DTO trafegado via HTTP — `createdAt` é string (ISO) no mock e no cliente.
export type ProjectDTO = {
  id: string;
  name: string;
  expectation: string;
  createdAt: string;
  // Contagem de vagas do projeto (relação denormalizada por `vagas.projeto`).
  openJobsCount: number;
  closedJobsCount: number;
};
