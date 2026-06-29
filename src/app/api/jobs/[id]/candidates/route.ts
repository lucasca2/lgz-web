import { z } from "zod";
import { createCandidatoSchema } from "@/domains/Recruitment/features/job-candidates/schemas/candidatoSchemas";
import { getJobCandidates } from "@/domains/Recruitment/features/job-candidates/server/queries/getJobCandidates";
import {
  CandidatoAlreadyInJobError,
  CandidatoExistsError,
  CandidatoNotFoundError,
  createJobCandidate,
  linkCandidateToJob,
} from "@/domains/Recruitment/features/job-candidates/server/mutations/createJobCandidate";

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const candidates = await getJobCandidates(id);
  return Response.json(candidates);
}

const linkSchema = z.object({ candidatoId: z.string().uuid() });

// POST: vincula um candidato existente ({ candidatoId }) OU cadastra um novo
// (createCandidatoSchema).
export async function POST(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);

  try {
    const link = linkSchema.safeParse(body);
    if (link.success) {
      const candidate = await linkCandidateToJob(id, link.data.candidatoId);
      return Response.json(candidate, { status: 201 });
    }

    const parsed = createCandidatoSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const candidate = await createJobCandidate(id, parsed.data);
    return Response.json(candidate, { status: 201 });
  } catch (err) {
    if (err instanceof CandidatoAlreadyInJobError) {
      return Response.json({ error: "already_in_job" }, { status: 409 });
    }
    if (err instanceof CandidatoExistsError) {
      return Response.json(
        { error: "candidato_exists", candidatoId: err.candidatoId },
        { status: 409 },
      );
    }
    if (err instanceof CandidatoNotFoundError) {
      return Response.json({ error: "not_found" }, { status: 404 });
    }
    throw err;
  }
}
