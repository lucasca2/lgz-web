"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { WaveLogo } from "@/shared/ui/WaveLogo";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarNav,
  SidebarNavItem,
} from "@/shared/ui/Sidebar";
import {
  DashboardIcon,
  BriefcaseIcon,
  ClipboardCheckIcon,
  FolderIcon,
  LayersIcon,
  SettingsIcon,
  LogOutIcon,
} from "@/shared/ui/icons";
import { ThemeToggle } from "@/shared/ui/ThemeToggle";
import { LocaleSwitcher } from "@/shared/ui/LocaleSwitcher";
import { useCurrentUser, useLogout } from "@/domains/Auth/shared/hooks";
import styles from "./AppSidebar.module.css";

// Iniciais a partir do nome/e-mail (fallback quando não há foto).
function userInitials(name: string | null, email: string): string {
  const base = name?.trim() || email.split("@")[0] || email;
  const parts = base.split(/[\s._-]+/).filter(Boolean);
  const chars =
    parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : base.slice(0, 2);
  return chars.toUpperCase();
}

// Sidebar da área autenticada: navegação + controles (tema/idioma) + logout,
// estilizada com os tokens do sistema.
export function AppSidebar() {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const router = useRouter();
  const logout = useLogout();
  const { data: currentUser } = useCurrentUser();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  function handleLogout() {
    if (logout.isPending || logout.isSuccess) return;
    logout.mutate(undefined, { onSuccess: () => router.refresh() });
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <WaveLogo />
      </SidebarHeader>

      <SidebarContent>
        <SidebarNav aria-label={t("primary")}>
          <SidebarNavItem
            href="/dashboard"
            icon={<DashboardIcon />}
            active={isActive("/dashboard")}
          >
            {t("dashboard")}
          </SidebarNavItem>
          <SidebarNavItem
            href="/jobs"
            icon={<BriefcaseIcon />}
            active={isActive("/jobs")}
          >
            {t("jobs")}
          </SidebarNavItem>
          <SidebarNavItem
            href="/avaliacoes"
            icon={<ClipboardCheckIcon />}
            active={isActive("/avaliacoes")}
          >
            {t("assessments")}
          </SidebarNavItem>
          <SidebarNavItem
            href="/positions"
            icon={<LayersIcon />}
            active={isActive("/positions")}
          >
            {t("positions")}
          </SidebarNavItem>
          <SidebarNavItem
            href="/projects"
            icon={<FolderIcon />}
            active={isActive("/projects")}
          >
            {t("projects")}
          </SidebarNavItem>
        </SidebarNav>
      </SidebarContent>

      <SidebarFooter>
        {currentUser ? (
          <div className={styles.user}>
            {currentUser.picture ? (
              <img
                className={styles.userAvatar}
                src={currentUser.picture}
                alt=""
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className={styles.userAvatar} aria-hidden="true">
                {userInitials(currentUser.name, currentUser.email)}
              </span>
            )}
            <div className={styles.userInfo}>
              <span className={styles.userName}>
                {currentUser.name ?? currentUser.email}
              </span>
              <span className={styles.userEmail}>{currentUser.email}</span>
            </div>
          </div>
        ) : null}

        <SidebarNav aria-label={t("secondary")}>
          <SidebarNavItem
            href="/settings"
            icon={<SettingsIcon />}
            active={isActive("/settings")}
          >
            {t("settings")}
          </SidebarNavItem>
          <SidebarNavItem
            icon={<LogOutIcon />}
            onClick={handleLogout}
            loading={logout.isPending || logout.isSuccess}
          >
            {t("logout")}
          </SidebarNavItem>
        </SidebarNav>

        <div className={styles.controls}>
          <ThemeToggle />
          <LocaleSwitcher placement="top" />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
