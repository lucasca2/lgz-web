import { updateJobStatusSchema } from "@/domains/Jobs/features/job-list/schemas/jobSchemas";
import { updateJobStatus } from "@/domains/Jobs/features/job-list/server/mutations/updateJobStatus";

export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = updateJobStatusSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const job = await updateJobStatus(id, parsed.data.status);
  if (!job) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json(job);
}
