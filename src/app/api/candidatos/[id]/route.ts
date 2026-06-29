import { requireUser } from "@/domains/Auth/shared/server/session";
import { updateCandidatoSchema } from "@/domains/Recruitment/features/job-candidates/schemas/candidatoSchemas";
import { getCandidatoForEdit } from "@/domains/Recruitment/features/job-candidates/server/queries/getCandidatoForEdit";
import {
  updateCandidato,
  CandidatoConflictError,
} from "@/domains/Recruitment/features/job-candidates/server/mutations/updateCandidato";

// GET /api/candidatos/[id] — dados editáveis do candidato (prefill do form).
export async function GET(
  _request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    await requireUser();
  } catch {
    return Response.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const candidato = await getCandidatoForEdit(id);
  if (!candidato) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }
  return Response.json(candidato);
}

// PATCH /api/candidatos/[id] — edita os dados do candidato.
export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    await requireUser();
  } catch {
    return Response.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = updateCandidatoSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const candidato = await updateCandidato(id, parsed.data);
    if (!candidato) {
      return Response.json({ error: "not_found" }, { status: 404 });
    }
    return Response.json(candidato);
  } catch (err) {
    if (err instanceof CandidatoConflictError) {
      return Response.json(
        { error: err.field === "email" ? "email_taken" : "linkedin_taken" },
        { status: 409 },
      );
    }
    throw err;
  }
}
