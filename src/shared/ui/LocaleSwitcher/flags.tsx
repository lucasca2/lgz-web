import type { Locale } from "@/i18n/config";

type FlagProps = { className?: string };

function BrazilFlag({ className }: FlagProps) {
  return (
    <svg className={className} viewBox="0 0 28 20" aria-hidden="true">
      <rect width="28" height="20" fill="#009b3a" />
      <polygon points="14,2.5 25.5,10 14,17.5 2.5,10" fill="#fedf00" />
      <circle cx="14" cy="10" r="4.2" fill="#002776" />
    </svg>
  );
}

function USFlag({ className }: FlagProps) {
  return (
    <svg className={className} viewBox="0 0 28 20" aria-hidden="true">
      <rect width="28" height="20" fill="#fff" />
      <g fill="#b22234">
        <rect y="0" width="28" height="2.86" />
        <rect y="5.71" width="28" height="2.86" />
        <rect y="11.43" width="28" height="2.86" />
        <rect y="17.14" width="28" height="2.86" />
      </g>
      <rect width="12.5" height="11.43" fill="#3c3b6e" />
      <g fill="#fff">
        <circle cx="2.6" cy="2.2" r="0.7" />
        <circle cx="6.2" cy="2.2" r="0.7" />
        <circle cx="9.8" cy="2.2" r="0.7" />
        <circle cx="4.4" cy="4.4" r="0.7" />
        <circle cx="8" cy="4.4" r="0.7" />
        <circle cx="2.6" cy="6.6" r="0.7" />
        <circle cx="6.2" cy="6.6" r="0.7" />
        <circle cx="9.8" cy="6.6" r="0.7" />
        <circle cx="4.4" cy="8.8" r="0.7" />
        <circle cx="8" cy="8.8" r="0.7" />
      </g>
    </svg>
  );
}

function SpainFlag({ className }: FlagProps) {
  return (
    <svg className={className} viewBox="0 0 28 20" aria-hidden="true">
      <rect width="28" height="20" fill="#aa151b" />
      <rect y="5" width="28" height="10" fill="#f1bf00" />
    </svg>
  );
}

export function Flag({
  locale,
  className,
}: {
  locale: Locale;
  className?: string;
}) {
  switch (locale) {
    case "pt-BR":
      return <BrazilFlag className={className} />;
    case "en":
      return <USFlag className={className} />;
    case "es":
      return <SpainFlag className={className} />;
  }
}
