import { requireUser } from "@/domains/Auth/shared/server/session";
import { searchCandidatos } from "@/domains/Recruitment/features/job-candidates/server/queries/searchCandidatos";

export const dynamic = "force-dynamic";

// GET /api/candidatos/search?q=... — autocomplete de candidatos da base.
export async function GET(request: Request) {
  try {
    await requireUser();
  } catch {
    return Response.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const q = new URL(request.url).searchParams.get("q") ?? "";
  const results = await searchCandidatos(q);
  return Response.json(results);
}
