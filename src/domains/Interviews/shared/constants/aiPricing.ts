import type { ClaudeUsage } from "@/shared/lib/anthropic";

// Preço por 1M tokens (USD), por modelo. Valores ESTIMADOS para popular
// `processos_seletivos.custo_estimado_usd` — confirmar com a tabela oficial da
// Anthropic se precisar de exatidão contábil. Chave = id enviado à Messages API
// (ver AVAILABLE_MODELS em ./aiModels).
export const MODEL_PRICING_USD_PER_MTOK: Record<
  string,
  { input: number; output: number }
> = {
  "claude-opus-4-8": { input: 15, output: 75 },
  "claude-sonnet-4-6": { input: 3, output: 15 },
  "claude-haiku-4-5-20251001": { input: 1, output: 5 },
};

// Custo estimado (USD) de uma chamada, arredondado a 4 casas (Decimal(10,4)).
// Modelo desconhecido → 0 (não trava o fluxo; só não estima).
export function estimateCostUsd(model: string, usage: ClaudeUsage): number {
  const price = MODEL_PRICING_USD_PER_MTOK[model];
  if (!price) return 0;

  const cost =
    (usage.inputTokens / 1_000_000) * price.input +
    (usage.outputTokens / 1_000_000) * price.output;

  return Math.round(cost * 10_000) / 10_000;
}
