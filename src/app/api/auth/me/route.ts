import { getCurrentUser } from "@/domains/Auth/shared/server/session";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  return Response.json(user, { status: 200 });
}
