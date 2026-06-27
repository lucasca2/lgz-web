import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { PagePlaceholder } from "@/shared/ui/PagePlaceholder";
import { CalendarIcon } from "@/shared/ui/icons";
import styles from "./dashboard.module.css";

export default async function DashboardPage() {
  const t = await getTranslations("Dashboard");

  return (
    <div className={styles.container}>
      <PagePlaceholder title={t("title")} subtitle={t("subtitle")} />

      <div className={styles.cta}>
        <p className={styles.ctaHint}>{t("scheduleCtaHint")}</p>
        <Link href="/agendar" className={styles.ctaButton}>
          <CalendarIcon />
          {t("scheduleCta")}
        </Link>
      </div>
    </div>
  );
}
