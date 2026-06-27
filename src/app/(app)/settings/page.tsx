import { getTranslations } from "next-intl/server";
import { PagePlaceholder } from "@/shared/ui/PagePlaceholder";

export default async function SettingsPage() {
  const t = await getTranslations("Settings");

  return <PagePlaceholder title={t("title")} subtitle={t("subtitle")} />;
}
