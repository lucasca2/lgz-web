import "server-only";

import Anthropic from "@anthropic-ai/sdk";

// Cliente Anthropic (SDK oficial). Server-only.
// Auth é SEMPRE por-usuário (não há chave global), nesta precedência:
//   1. `setupToken` (OAuth, `claude setup-token`) — `Authorization: Bearer` +
//      header beta `oauth-2025-04-20`. apiKey:null evita mandar x-api-key junto
//      (a API rejeita os dois).
//   2. `apiKey` (API key pessoal do usuário) — x-api-key.
// `ANTHROPIC_BASE_URL` é opcional (permite apontar para um proxy local).
const OAUTH_BETA = "oauth-2025-04-20";

let userKeyClient: { key: string; client: Anthropic } | null = null;
let oauthClient: { token: string; client: Anthropic } | null = null;

export class MissingAnthropicKeyError extends Error {
  constructor() {
    super(
      "Credencial da IA não configurada — defina um setup token ou API key nas Configurações.",
    );
    this.name = "MissingAnthropicKeyError";
  }
}

function getClient(
  setupToken?: string | null,
  apiKey?: string | null,
): Anthropic {
  const baseURL = process.env.ANTHROPIC_BASE_URL;

  // 1. Setup token (OAuth).
  if (setupToken) {
    if (!oauthClient || oauthClient.token !== setupToken) {
      oauthClient = {
        token: setupToken,
        client: new Anthropic({
          authToken: setupToken,
          // Não deixe a SDK pegar a ANTHROPIC_API_KEY da env: mandar Bearer +
          // x-api-key juntos resulta em 401.
          apiKey: null,
          defaultHeaders: { "anthropic-beta": OAUTH_BETA },
          ...(baseURL ? { baseURL } : {}),
        }),
      };
    }
    return oauthClient.client;
  }

  // 2. API key pessoal do usuário.
  if (apiKey) {
    if (!userKeyClient || userKeyClient.key !== apiKey) {
      userKeyClient = {
        key: apiKey,
        client: new Anthropic({ apiKey, ...(baseURL ? { baseURL } : {}) }),
      };
    }
    return userKeyClient.client;
  }

  // Sem credencial do usuário → erro (não há chave global).
  throw new MissingAnthropicKeyError();
}

type ClaudeArgs = {
  system: string;
  user: string;
  model: string;
  maxTokens?: number;
  // Auth opcional por chamada (precedência: setupToken > apiKey > env).
  setupToken?: string | null;
  apiKey?: string | null;
};

export type ClaudeUsage = {
  inputTokens: number;
  outputTokens: number;
};

export type ClaudeResult = {
  text: string;
  usage: ClaudeUsage;
};

// Uma chamada bloqueante à Messages API. Retorna o texto concatenado dos blocos
// + o uso de tokens (para rastreio de custo). Use `claudeMessage` quando só o
// texto interessa.
export async function claudeMessageRaw({
  system,
  user,
  model,
  maxTokens = 4000,
  setupToken,
  apiKey,
}: ClaudeArgs): Promise<ClaudeResult> {
  const response = await getClient(setupToken, apiKey).messages.create({
    model,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: user }],
  });

  return {
    text: response.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join(""),
    usage: {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    },
  };
}

// Atalho que devolve só o texto (mantido para os callers existentes).
export async function claudeMessage(args: ClaudeArgs): Promise<string> {
  return (await claudeMessageRaw(args)).text;
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
