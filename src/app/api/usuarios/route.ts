import { requireUser } from "@/domains/Auth/shared/server/session";
import { listActiveUsuarios } from "@/domains/Auth/shared/server/listActiveUsuarios";

export async function GET() {
  try {
    await requireUser();
  } catch {
    return Response.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const usuarios = await listActiveUsuarios();
  return Response.json(usuarios);
}
