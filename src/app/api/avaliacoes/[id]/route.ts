import { updateAssessmentSchema } from "@/domains/Interviews/features/interview-assessment/schemas/assessmentSchemas";
import { getAssessmentById } from "@/domains/Interviews/features/interview-assessment/server/queries/getAssessmentById";
import { updateAssessment } from "@/domains/Interviews/features/interview-assessment/server/mutations/updateAssessment";
import { deleteAssessment } from "@/domains/Interviews/features/interview-assessment/server/mutations/deleteAssessment";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const assessment = await getAssessmentById(id);
  if (!assessment) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(assessment);
}

export async function PATCH(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = updateAssessmentSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const assessment = await updateAssessment(id, parsed.data);
  if (!assessment) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(assessment);
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const ok = await deleteAssessment(id);
  if (!ok) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ ok: true });
}
