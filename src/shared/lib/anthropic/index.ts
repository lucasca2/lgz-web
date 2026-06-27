import "server-only";

import Anthropic from "@anthropic-ai/sdk";

// Cliente Anthropic (SDK oficial). Server-only: usa a ANTHROPIC_API_KEY.
// `ANTHROPIC_BASE_URL` é opcional (permite apontar para um proxy local).
let client: Anthropic | null = null;

export class MissingAnthropicKeyError extends Error {
  constructor() {
    super("ANTHROPIC_API_KEY não configurada.");
    this.name = "MissingAnthropicKeyError";
  }
}

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new MissingAnthropicKeyError();

  if (!client) {
    const baseURL = process.env.ANTHROPIC_BASE_URL;
    client = new Anthropic({ apiKey, ...(baseURL ? { baseURL } : {}) });
  }
  return client;
}

type ClaudeArgs = {
  system: string;
  user: string;
  model: string;
  maxTokens?: number;
};

// Uma chamada bloqueante à Messages API. Retorna o texto concatenado dos blocos.
export async function claudeMessage({
  system,
  user,
  model,
  maxTokens = 4000,
}: ClaudeArgs): Promise<string> {
  const response = await getClient().messages.create({
    model,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: user }],
  });

  return response.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("");
}

// Remove cercas de código (```json / ```) e faz JSON.parse. Lança em JSON inválido.
export function extractJson<T>(text: string): T {
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
  return JSON.parse(cleaned) as T;
}

// Remove cercas de markdown (```markdown / ```) de uma saída em texto livre.
export function stripMarkdownFences(text: string): string {
  return text
    .replace(/^```(?:markdown|md)?\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}
