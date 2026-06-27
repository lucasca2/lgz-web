import { generateRejectionTemplate } from "@/domains/Interviews/features/interview-assessment/server/mutations/generateRejectionTemplate";
import { aiErrorResponse } from "@/domains/Interviews/features/interview-assessment/server/httpErrors";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  try {
    const justificativa = await generateRejectionTemplate(id);
    return Response.json({ justificativa });
  } catch (err) {
    return aiErrorResponse(err);
  }
}
