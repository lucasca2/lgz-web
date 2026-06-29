import { z } from "zod";
import { requireUser } from "@/domains/Auth/shared/server/session";
import {
  computeFitScore,
  MissingCandidateDataError,
  ProcessoNotFoundError,
} from "@/domains/Recruitment/features/candidate-board/server/mutations/computeFitScore";
import { setProcessoScore } from "@/domains/Recruitment/features/candidate-board/server/mutations/setProcessoScore";

type Ctx = { params: Promise<{ processoId: string }> };

async function auth(): Promise<boolean> {
  try {
    await requireUser();
    return true;
  } catch {
    return false;
  }
}

// POST: calcula o score de fit por IA (escopo vaga/posição/projeto × dados do candidato).
export async function POST(_request: Request, { params }: Ctx) {
  if (!(await auth())) {
    return Response.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  const { processoId } = await params;

  try {
    const result = await computeFitScore(processoId);
    return Response.json(result);
  } catch (err) {
    if (err instanceof MissingCandidateDataError) {
      return Response.json({ error: "MISSING_CANDIDATE_DATA" }, { status: 422 });
    }
    if (err instanceof ProcessoNotFoundError) {
      return Response.json({ error: "not_found" }, { status: 404 });
    }
    // Falha de IA (rede, JSON inválido, shape inesperado).
    return Response.json({ error: "AI_ERROR" }, { status: 502 });
  }
}

const patchSchema = z.object({ score: z.number().int().min(0).max(100) });

// PATCH: define o score manualmente.
export async function PATCH(request: Request, { params }: Ctx) {
  if (!(await auth())) {
    return Response.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  const { processoId } = await params;

  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await setProcessoScore(processoId, parsed.data.score);
    return Response.json(result);
  } catch (err) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code?: string }).code === "P2025"
    ) {
      return Response.json({ error: "not_found" }, { status: 404 });
    }
    return Response.json({ error: "internal" }, { status: 500 });
  }
}
