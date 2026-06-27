import { getTranslations } from "next-intl/server";
import { CandidateBoardScreen } from "@/domains/Recruitment/features/candidate-board/screens/CandidateBoardScreen";

export default async function InterviewsPage() {
  const t = await getTranslations("Interviews");

  return <CandidateBoardScreen title={t("title")} subtitle={t("subtitle")} />;
}
