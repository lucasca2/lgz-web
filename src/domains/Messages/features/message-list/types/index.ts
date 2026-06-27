// DTO trafegado via HTTP — `createdAt` chega como string (JSON) ao cliente.
export type MessageDTO = {
  id: string;
  text: string;
  createdAt: string;
};
