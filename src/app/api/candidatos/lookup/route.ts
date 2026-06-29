import { requireUser } from "@/domains/Auth/shared/server/session";
import { getCandidatoByLinkedin } from "@/domains/Recruitment/features/job-candidates/server/queries/getCandidatoForEdit";

export const dynamic = "force-dynamic";

// GET /api/candidatos/lookup?linkedin=... — devolve o candidato com aquele
// linkedin_url EXATO (dados editáveis) ou `null`. Usado no cadastro para
// detectar duplicidade e pré-preencher o formulário.
export async function GET(request: Request) {
  try {
    await requireUser();
  } catch {
    return Response.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const linkedin = new URL(request.url).searchParams.get("linkedin") ?? "";
  const candidato = await getCandidatoByLinkedin(linkedin);
  return Response.json(candidato);
}
