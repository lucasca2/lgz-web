import { RecruiterScreen } from "@/domains/Scheduling/features/recruiter";

export default async function AgendarPage({
  searchParams,
}: {
  searchParams: Promise<{ candidate?: string }>;
}) {
  const { candidate } = await searchParams;
  return <RecruiterScreen candidate={candidate} />;
}
