import { requireUser } from "@/domains/Auth/shared/server/session";
import {
  getCurrentUserAiAuth,
  setUserSetupToken,
  setUserApiKey,
} from "@/domains/Auth/shared/server/setupToken";
import {
  getAiSettings,
  saveAiSettings,
  AI_DEFAULTS,
} from "@/domains/Interviews/shared/server/aiSettings";
import { AVAILABLE_MODELS } from "@/domains/Interviews/shared/constants/aiModels";
import { settingsSchema } from "@/domains/Interviews/features/interview-assessment/schemas/assessmentSchemas";
import type { CurrentUser } from "@/domains/Auth/shared/types";

export const dynamic = "force-dynamic";

// Modelo + prompts são globais (singleton); setup token e API key são por-usuário
// e write-only (o response só diz se o usuário tem cada credencial salva).
async function buildResponse() {
  const [settings, auth] = await Promise.all([
    getAiSettings(),
    getCurrentUserAiAuth(),
  ]);
  return {
    settings,
    defaults: AI_DEFAULTS,
    availableModels: AVAILABLE_MODELS,
    hasSetupToken: Boolean(auth.setupToken),
    hasApiKey: Boolean(auth.apiKey),
  };
}

export async function GET() {
  try {
    await requireUser();
  } catch {
    return Response.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  return Response.json(await buildResponse());
}

export async function PUT(request: Request) {
  let user: CurrentUser;
  try {
    user = await requireUser();
  } catch {
    return Response.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Modelo + prompts (global).
  await saveAiSettings(parsed.data);

  // Credenciais por-usuário: omitido = mantém; "" = limpa; valor = grava.
  if (parsed.data.setupToken !== undefined) {
    await setUserSetupToken(user.id, parsed.data.setupToken || null);
  }
  if (parsed.data.apiKey !== undefined) {
    await setUserApiKey(user.id, parsed.data.apiKey || null);
  }

  return Response.json(await buildResponse());
}
