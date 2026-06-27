import { useTranslations } from "next-intl";
import { LocaleSwitcher } from "@/shared/ui/LocaleSwitcher";

export default function Page() {
  const t = useTranslations("HomePage");

  return (
    <main>
      <h1>{t("hello")}</h1>
      <LocaleSwitcher />
    </main>
  );
}
