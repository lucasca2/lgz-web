import { AssessmentDetailScreen } from "@/domains/Interviews/features/interview-assessment/screens/AssessmentDetailScreen";

export default async function AvaliacaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AssessmentDetailScreen id={id} />;
}
