import { listQuerySchema } from "@/domains/Interviews/features/interview-assessment/schemas/assessmentSchemas";
import { listAssessments } from "@/domains/Interviews/features/interview-assessment/server/queries/listAssessments";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = listQuerySchema.safeParse(Object.fromEntries(searchParams));

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await listAssessments(parsed.data);
  return Response.json(result);
}
