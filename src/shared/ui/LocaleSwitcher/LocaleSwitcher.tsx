"use client";

import { useLocale } from "next-intl";
import { useTransition } from "react";
import { locales, localeLabels, type Locale } from "@/i18n/config";
import { setUserLocale } from "@/i18n/locale";

export function LocaleSwitcher() {
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();

  function onChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const nextLocale = event.target.value as Locale;
    startTransition(() => {
      setUserLocale(nextLocale);
    });
  }

  return (
    <select
      value={locale}
      onChange={onChange}
      disabled={isPending}
      aria-label="Language"
    >
      {locales.map((loc) => (
        <option key={loc} value={loc}>
          {localeLabels[loc]}
        </option>
      ))}
    </select>
  );
}
