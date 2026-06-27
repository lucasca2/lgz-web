import { getTranslations } from "next-intl/server";
import { PagePlaceholder } from "@/shared/ui/PagePlaceholder";

export default async function InterviewsPage() {
  const t = await getTranslations("Interviews");

  return <PagePlaceholder title={t("title")} subtitle={t("subtitle")} />;
}
