import type { NextRequest } from "next/server";
import { requireUser } from "@/domains/Auth/shared/server/session";
import { candidatoFilterSchema } from "@/domains/Candidatos/features/candidato-list/schemas/candidatoFilterSchema";
import { listCandidatos } from "@/domains/Candidatos/features/candidato-list/server/queries/listCandidatos";

export async function GET(request: NextRequest) {
  try {
    await requireUser();
  } catch {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const params = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = candidatoFilterSchema.safeParse(params);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await listCandidatos(parsed.data);
  return Response.json(result, { status: 200 });
}
