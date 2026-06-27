// Modelos Claude disponíveis para a avaliação de entrevistas.
// O id é enviado direto para a Anthropic Messages API.
export const AVAILABLE_MODELS = [
  { id: "claude-opus-4-8", label: "Claude Opus 4.8 (mais capaz)" },
  { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6 (equilibrado)" },
  { id: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5 (rápido)" },
] as const;

export const DEFAULT_MODEL = "claude-sonnet-4-6";
