import "server-only";

import { prisma } from "@/shared/lib/prisma";
import { getCurrentUser } from "./session";

export type AiAuth = { setupToken: string | null; apiKey: string | null };

// Credenciais de IA pessoais do usuário logado. Precedência (aplicada no
// client Anthropic): setup token > API key > ANTHROPIC_API_KEY global.
export async function getCurrentUserAiAuth(): Promise<AiAuth> {
  const user = await getCurrentUser();
  if (!user) return { setupToken: null, apiKey: null };

  const row = await prisma.usuarios.findUnique({
    where: { id: user.id },
    select: { setup_token: true, api_key: true },
  });
  return {
    setupToken: row?.setup_token ?? null,
    apiKey: row?.api_key ?? null,
  };
}

// Define (ou limpa, com null) o setup token de um usuário.
export async function setUserSetupToken(
  userId: string,
  token: string | null,
): Promise<void> {
  await prisma.usuarios.update({
    where: { id: userId },
    data: { setup_token: token },
  });
}

// Define (ou limpa, com null) a API key pessoal de um usuário.
export async function setUserApiKey(
  userId: string,
  key: string | null,
): Promise<void> {
  await prisma.usuarios.update({
    where: { id: userId },
    data: { api_key: key },
  });
}
