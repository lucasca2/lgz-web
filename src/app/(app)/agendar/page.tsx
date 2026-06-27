import { RecruiterScreen } from "@/domains/Scheduling/features/recruiter";

export default async function AgendarPage({
  searchParams,
}: {
  searchParams: Promise<{
    candidate?: string;
    candidateId?: string;
    position?: string;
  }>;
}) {
  const { candidate, candidateId, position } = await searchParams;
  return (
    <RecruiterScreen
      candidate={candidate}
      candidateId={candidateId}
      position={position}
    />
  );
}
