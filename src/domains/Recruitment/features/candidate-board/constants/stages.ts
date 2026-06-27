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

// Acento de cor por etapa (token do globals.css). Usado em dot da coluna,
// borda/avatar do card e badge no modal — aplicado via CSS var --stage-accent.
export const STAGE_ACCENT: Record<BoardStage, string> = {
  Triagem: "var(--wave-stage-triagem)",
  "Fit Cultural": "var(--wave-stage-fit)",
  People: "var(--wave-stage-people)",
  "Entrevista Técnica": "var(--wave-stage-tecnica)",
  "Entrevista Cultural": "var(--wave-stage-cultural)",
  Proposta: "var(--wave-stage-proposta)",
  Contratação: "var(--wave-stage-contratacao)",
  Rejeição: "var(--wave-stage-rejeicao)",
};
