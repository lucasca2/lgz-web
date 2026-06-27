import { generateRecommendation } from "@/domains/Interviews/features/interview-assessment/server/mutations/generateRecommendation";
import { aiErrorResponse } from "@/domains/Interviews/features/interview-assessment/server/httpErrors";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  try {
    const assessment = await generateRecommendation(id);
    return Response.json(assessment);
  } catch (err) {
    return aiErrorResponse(err);
  }
}
