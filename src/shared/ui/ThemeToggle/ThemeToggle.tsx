"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { SunIcon, MoonIcon } from "@/shared/ui/icons";
import { getCurrentTheme, applyTheme, type Theme } from "@/shared/lib/theme";
import styles from "./ThemeToggle.module.css";

// Alterna entre claro/escuro. O tema real é definido antes do paint pelo script
// inline; aqui sincronizamos o estado no mount para refletir o ícone correto.
export function ThemeToggle() {
  const t = useTranslations("Nav");
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(getCurrentTheme());
    setMounted(true);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
  }

  const isDark = mounted && theme === "dark";
  const label = isDark ? t("themeLight") : t("themeDark");

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggle}
      aria-label={label}
      title={label}
    >
      {isDark ? (
        <SunIcon className={styles.icon} />
      ) : (
        <MoonIcon className={styles.icon} />
      )}
    </button>
  );
}
