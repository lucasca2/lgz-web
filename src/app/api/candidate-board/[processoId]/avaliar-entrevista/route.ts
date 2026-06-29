import { z } from "zod";
import { requireUser } from "@/domains/Auth/shared/server/session";
import { evaluateInterviewForProcesso } from "@/domains/Recruitment/features/candidate-board/server/mutations/evaluateInterviewForProcesso";
import { ProcessoNotFoundError } from "@/domains/Recruitment/features/candidate-board/server/mutations/computeFitScore";
import { getProcessoAssessments } from "@/domains/Recruitment/features/candidate-board/server/queries/getProcessoAssessments";

type Ctx = { params: Promise<{ processoId: string }> };

async function authed(): Promise<boolean> {
  try {
    await requireUser();
    return true;
  } catch {
    return false;
  }
}

const bodySchema = z.object({
  transcricao: z.string().trim().min(20).max(200_000),
});

// POST: avalia uma transcrição de entrevista e vincula a avaliação ao processo.
export async function POST(request: Request, { params }: Ctx) {
  if (!(await authed())) {
    return Response.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  const { processoId } = await params;

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await evaluateInterviewForProcesso(
      processoId,
      parsed.data.transcricao,
    );
    return Response.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof ProcessoNotFoundError) {
      return Response.json({ error: "not_found" }, { status: 404 });
    }
    return Response.json({ error: "AI_ERROR" }, { status: 502 });
  }
}

// GET: lista as avaliações de entrevista do processo.
export async function GET(_request: Request, { params }: Ctx) {
  if (!(await authed())) {
    return Response.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  const { processoId } = await params;
  const items = await getProcessoAssessments(processoId);
  return Response.json(items);
}
