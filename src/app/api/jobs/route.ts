import { createJobSchema } from "@/domains/Jobs/features/job-list/schemas/jobSchemas";
import { createJob } from "@/domains/Jobs/features/job-list/server/mutations/createJob";
import { getJobs } from "@/domains/Jobs/features/job-list/server/queries/getJobs";

export async function GET() {
  const jobs = await getJobs();
  return Response.json(jobs);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = createJobSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const job = await createJob(parsed.data);
  return Response.json(job, { status: 201 });
}
