import { createProjectSchema } from "@/domains/Projects/features/project-list/schemas/projectSchemas";
import { updateProject } from "@/domains/Projects/features/project-list/server/mutations/updateProject";

export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = createProjectSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const project = updateProject(id, parsed.data);
  if (!project) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json(project);
}
