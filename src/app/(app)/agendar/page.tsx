import { RecruiterScreen } from "@/domains/Scheduling/features/recruiter";

export default async function AgendarPage({
  searchParams,
}: {
  searchParams: Promise<{ candidate?: string; candidateId?: string }>;
}) {
  const { candidate, candidateId } = await searchParams;
  return <RecruiterScreen candidate={candidate} candidateId={candidateId} />;
}
