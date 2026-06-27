// Usuário exposto ao cliente — NUNCA inclui passwordHash.
export type CurrentUser = {
  id: string;
  email: string;
  name: string | null;
};
