import { requireUser } from "@/domains/Auth/shared/server/session";
import {
  hasDirectoryScope,
  refreshAccessToken,
  searchDirectoryPeople,
} from "@/shared/lib/google";
import { prisma } from "@/shared/lib/prisma";

// Busca pessoas no diretório do Workspace (People API), agindo como o recrutador.
// Códigos de resposta para o cliente distinguir os cenários:
//   200 { people }        → sucesso (lista pode vir vazia = "ninguém bate a busca")
//   403 { code:"RELOGIN" }    → sem refresh token / sem escopo directory / 401 do Google
//   503 { code:"UNAVAILABLE" }→ People API desligada no GCP ou diretório bloqueado (403)
//   500 { code:"ERROR" }      → falha inesperada
export async function GET(request: Request) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return Response.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const q = (new URL(request.url).searchParams.get("q") ?? "").trim();
  if (q.length < 2) {
    return Response.json({ people: [] });
  }

  const u = await prisma.usuarios.findUnique({
    where: { id: user.id },
    select: { google_refresh_token: true, google_scope: true },
  });

  if (!u?.google_refresh_token || !hasDirectoryScope(u.google_scope ?? "")) {
    return Response.json({ code: "RELOGIN" }, { status: 403 });
  }

  try {
    const tokens = await refreshAccessToken(u.google_refresh_token);
    if (!tokens.accessToken) {
      return Response.json({ code: "RELOGIN" }, { status: 403 });
    }
    const people = await searchDirectoryPeople(tokens.accessToken, q);
    return Response.json({ people });
  } catch (e) {
    const status = (e as { status?: number }).status;
    if (status === 401) {
      return Response.json({ code: "RELOGIN" }, { status: 403 });
    }
    if (status === 403) {
      return Response.json({ code: "UNAVAILABLE" }, { status: 503 });
    }
    return Response.json({ code: "ERROR" }, { status: 500 });
  }
}
