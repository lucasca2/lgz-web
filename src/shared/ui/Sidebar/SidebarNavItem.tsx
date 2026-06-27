import type { ReactNode } from "react";
import Link from "next/link";
import styles from "./Sidebar.module.css";

type SidebarNavItemProps = {
  icon: ReactNode;
  children: ReactNode;
  active?: boolean;
  // Link de navegação...
  href?: string;
  // ...ou ação (ex.: logout). Use um ou outro.
  onClick?: () => void;
  loading?: boolean;
};

// Item da sidebar: ícone + label. Vira <Link> quando `href`, ou <button> quando `onClick`.
export function SidebarNavItem({
  icon,
  children,
  active = false,
  href,
  onClick,
  loading = false,
}: SidebarNavItemProps) {
  const className = [styles.item, active && styles.itemActive]
    .filter(Boolean)
    .join(" ");

  const inner = (
    <>
      <span className={styles.itemIcon} aria-hidden="true">
        {loading ? <span className={styles.spinner} /> : icon}
      </span>
      <span className={styles.itemLabel}>{children}</span>
    </>
  );

  return (
    <li>
      {href ? (
        <Link
          href={href}
          className={className}
          aria-current={active ? "page" : undefined}
        >
          {inner}
        </Link>
      ) : (
        <button
          type="button"
          className={className}
          onClick={onClick}
          disabled={loading}
          aria-busy={loading || undefined}
        >
          {inner}
        </button>
      )}
    </li>
  );
}
