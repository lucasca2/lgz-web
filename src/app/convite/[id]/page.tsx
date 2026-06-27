import { CandidateScreen } from "@/domains/Scheduling/features/candidate";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CandidateScreen id={id} />;
}
