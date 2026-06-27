import { createCandidatoSchema } from "@/domains/Recruitment/features/job-candidates/schemas/candidatoSchemas";
import { getJobCandidates } from "@/domains/Recruitment/features/job-candidates/server/queries/getJobCandidates";
import {
  CandidatoAlreadyInJobError,
  createJobCandidate,
} from "@/domains/Recruitment/features/job-candidates/server/mutations/createJobCandidate";

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const candidates = await getJobCandidates(id);
  return Response.json(candidates);
}

export async function POST(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = createCandidatoSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const candidate = await createJobCandidate(id, parsed.data);
    return Response.json(candidate, { status: 201 });
  } catch (err) {
    if (err instanceof CandidatoAlreadyInJobError) {
      return Response.json(
        { error: "Candidato já está nesta vaga" },
        { status: 409 },
      );
    }
    throw err;
  }
}
