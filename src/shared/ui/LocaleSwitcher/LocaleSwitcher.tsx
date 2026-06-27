"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  locales,
  localeLabels,
  localeShort,
  type Locale,
} from "@/i18n/config";
import { setUserLocale } from "@/i18n/locale";
import { Flag } from "./flags";
import styles from "./LocaleSwitcher.module.css";

export function LocaleSwitcher() {
  const t = useTranslations("Common");
  const current = useLocale() as Locale;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function selectLocale(locale: Locale) {
    setOpen(false);
    if (locale === current) return;
    // Grava o cookie e força o re-render dos Server Components (locale é
    // resolvido server-side a partir do cookie), senão a troca não aparece.
    startTransition(async () => {
      await setUserLocale(locale);
      router.refresh();
    });
  }

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((value) => !value)}
        disabled={isPending}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("language")}
      >
        <Flag locale={current} className={styles.flag} />
        <span className={styles.short}>{localeShort[current]}</span>
        <svg
          className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
          viewBox="0 0 12 12"
          aria-hidden="true"
        >
          <path
            d="M2.5 4.5 6 8l3.5-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open ? (
        <ul className={styles.menu} role="listbox" aria-label={t("language")}>
          {locales.map((locale) => (
            <li key={locale}>
              <button
                type="button"
                role="option"
                aria-selected={locale === current}
                className={[
                  styles.option,
                  locale === current && styles.optionActive,
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => selectLocale(locale)}
              >
                <Flag locale={locale} className={styles.flag} />
                <span className={styles.optionLabel}>
                  {localeLabels[locale]}
                </span>
                <span className={styles.optionShort}>
                  {localeShort[locale]}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
