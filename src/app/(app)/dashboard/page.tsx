import { getTranslations } from "next-intl/server";
import { PagePlaceholder } from "@/shared/ui/PagePlaceholder";

export default async function DashboardPage() {
  const t = await getTranslations("Dashboard");

  return <PagePlaceholder title={t("title")} subtitle={t("subtitle")} />;
}
