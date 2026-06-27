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
  SettingsIcon,
  LogOutIcon,
} from "@/shared/ui/icons";
import { ThemeToggle } from "@/shared/ui/ThemeToggle";
import { LocaleSwitcher } from "@/shared/ui/LocaleSwitcher";
import { useLogout } from "@/domains/Auth/shared/hooks";
import styles from "./AppSidebar.module.css";
import { Button } from "../Button";

// Sidebar da área autenticada: navegação + controles (tema/idioma) + logout,
// estilizada com os tokens do sistema.
export function AppSidebar() {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const router = useRouter();
  const logout = useLogout();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  function handleLogout() {
    if (logout.isPending || logout.isSuccess) return;
    logout.mutate(undefined, { onSuccess: () => router.refresh() });
  }

  async function handleClickLinkedin() {
    const res = await fetch("/api/linkedin/auth/login", { method: "POST" })
  }
  function handleClickLinkedinUser() {
    fetch("/api/linkedin/profile/henrique-tsugiyama")
  }

  function handleClickLinkedinSearch() {
    fetch(
      '/api/linkedin/search?' + new URLSearchParams({
        keywords: 'software engineer',
        location: 'San Francisco',
        page: String(0),              // ← or just '0'
      })
    );
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
            icon={<BriefcaseIcon />}
            active={isActive("/linkedin")}
            onClick={handleClickLinkedin}
          >
            {"linkedin"}
          </SidebarNavItem>
          <SidebarNavItem
            icon={<BriefcaseIcon />}
            active={isActive("/linkedin/user")}
            onClick={handleClickLinkedinUser}
          >
            {"linkedin-user"}
          </SidebarNavItem>
          <SidebarNavItem
            icon={<BriefcaseIcon />}
            active={isActive("/linkedin/search")}
            onClick={handleClickLinkedinSearch}
          >
            {"linkedin-search"}
          </SidebarNavItem>
        </SidebarNav>
      </SidebarContent>

      <SidebarFooter>
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
