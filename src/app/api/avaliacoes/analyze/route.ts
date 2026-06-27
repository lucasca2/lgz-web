import { analyzeSchema } from "@/domains/Interviews/features/interview-assessment/schemas/assessmentSchemas";
import { createAssessmentFromTranscript } from "@/domains/Interviews/features/interview-assessment/server/mutations/createAssessmentFromTranscript";
import { aiErrorResponse } from "@/domains/Interviews/features/interview-assessment/server/httpErrors";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = analyzeSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const assessment = await createAssessmentFromTranscript({
      transcricao: parsed.data.transcricao,
      posicaoId: parsed.data.posicaoId ?? null,
    });
    return Response.json(assessment, { status: 201 });
  } catch (err) {
    return aiErrorResponse(err);
  }
}
