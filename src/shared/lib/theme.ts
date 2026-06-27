export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "wave-theme";

// Script inline (anti-flash): roda síncrono durante o parse do HTML, antes do
// primeiro paint. Resolve a preferência salva ou, na ausência, a do sistema,
// e fixa `data-theme` no <html>. Mantido como string para injeção no <head>.
export const themeInitScript = `(function(){try{var k="${THEME_STORAGE_KEY}";var t=localStorage.getItem(k);if(t!=="dark"&&t!=="light"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}document.documentElement.dataset.theme=t;}catch(e){}})();`;

// Lê o tema atual já resolvido no DOM (definido pelo script inline).
export function getCurrentTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

// Aplica o tema no DOM e persiste a escolha do usuário.
export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // localStorage indisponível (modo privado, etc.) — ignora.
  }
}
