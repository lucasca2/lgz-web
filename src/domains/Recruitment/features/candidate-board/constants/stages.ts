// Colunas do board = etapas do pipeline (catálogo `etapas_catalogo`, semeado).
// O id da coluna é o `nome` da etapa (bate com etapas_catalogo.nome).
export const BOARD_STAGES = [
  "Triagem",
  "Fit Cultural",
  "People",
  "Teste Técnico",
  "Entrevistas",
  "Proposta",
  "Aprovado",
  "Recusado",
] as const;

export type BoardStage = (typeof BOARD_STAGES)[number];

// Etapas terminais — também sincronizam o `status_atual` do processo.
export const APPROVED_STAGE: BoardStage = "Aprovado";
export const REJECTED_STAGE: BoardStage = "Recusado";

// Acento de cor por etapa (token do globals.css). Usado em dot da coluna,
// borda/avatar do card e badge no modal — aplicado via CSS var --stage-accent.
export const STAGE_ACCENT: Record<BoardStage, string> = {
  Triagem: "var(--wave-stage-triagem)",
  "Fit Cultural": "var(--wave-stage-fit)",
  People: "var(--wave-stage-people)",
  "Teste Técnico": "var(--wave-stage-tecnica)",
  Entrevistas: "var(--wave-stage-cultural)",
  Proposta: "var(--wave-stage-proposta)",
  Aprovado: "var(--wave-stage-contratacao)",
  Recusado: "var(--wave-stage-rejeicao)",
};
