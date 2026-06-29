import { requireUser } from "@/domains/Auth/shared/server/session";
import { getCurrentUserAiAuth } from "@/domains/Auth/shared/server/setupToken";

export const dynamic = "force-dynamic";

// Diz se o usuário logado tem alguma credencial de IA (setup token ou API key).
// Usado pelo guard de UI antes de disparar ações de IA. Não expõe os valores.
export async function GET() {
  try {
    await requireUser();
  } catch {
    return Response.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const auth = await getCurrentUserAiAuth();
  return Response.json({ configured: Boolean(auth.setupToken || auth.apiKey) });
}
