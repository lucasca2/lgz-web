import { ORIGEM_VALUES, type Origem } from "../schemas/candidatoSchemas";

export const apiRoutes = {
  candidates: (vagaId: string) => `/api/jobs/${vagaId}/candidates`,
} as const;

// Opções para o <Select> de origem. O label é resolvido via i18n no componente;
// aqui ficam só os valores do enum.
export const ORIGEM_OPTIONS: readonly Origem[] = ORIGEM_VALUES;
