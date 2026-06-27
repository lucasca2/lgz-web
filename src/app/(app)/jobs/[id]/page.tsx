import { notFound } from "next/navigation";
import { getJobById } from "@/domains/Jobs/features/job-list/server/queries/getJobById";
import { JobDetailScreen } from "@/domains/Recruitment/features/job-candidates/screens/JobDetailScreen";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await getJobById(id);

  if (!job) notFound();

  return <JobDetailScreen job={job} />;
}
