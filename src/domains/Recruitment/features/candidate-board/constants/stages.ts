export const BOARD_STAGES = [
  "Triagem",
  "Fit Cultural",
  "People",
  "Entrevista Técnica",
  "Entrevista Cultural",
  "Proposta",
  "Contratação",
  "Rejeição",
] as const;

export type BoardStage = (typeof BOARD_STAGES)[number];
