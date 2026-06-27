import { createProjectSchema } from "@/domains/Projects/features/project-list/schemas/projectSchemas";
import { createProject } from "@/domains/Projects/features/project-list/server/mutations/createProject";
import { getProjects } from "@/domains/Projects/features/project-list/server/queries/getProjects";

export async function GET() {
  const projects = await getProjects();
  return Response.json(projects);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = createProjectSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const project = await createProject(parsed.data);
  return Response.json(project, { status: 201 });
}
