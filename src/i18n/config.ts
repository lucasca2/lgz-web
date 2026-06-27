export const locales = ["pt-BR", "en", "es"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "pt-BR";

export const localeLabels: Record<Locale, string> = {
  "pt-BR": "Português",
  en: "English",
  es: "Español",
};

// Sigla do país exibida no seletor de idioma (acompanha a bandeira).
export const localeShort: Record<Locale, string> = {
  "pt-BR": "BR",
  en: "US",
  es: "ES",
};
