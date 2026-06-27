import type { Nivel } from "../constants/niveis";

// DTO trafegado via HTTP — `createdAt` é string (ISO) no cliente.
export type PositionDTO = {
  id: string;
  name: string;
  nivel: Nivel;
  descricao: string;
  createdAt: string;
};
