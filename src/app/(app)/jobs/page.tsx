import { getTranslations } from "next-intl/server";
import { PagePlaceholder } from "@/shared/ui/PagePlaceholder";

export default async function JobsPage() {
  const t = await getTranslations("Jobs");

  return <PagePlaceholder title={t("title")} subtitle={t("subtitle")} />;
}
