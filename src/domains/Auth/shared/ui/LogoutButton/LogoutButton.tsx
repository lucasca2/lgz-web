"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/Button";
import { useLogout } from "@/domains/Auth/shared/hooks";

export function LogoutButton() {
  const t = useTranslations("HomePage");
  const router = useRouter();
  const logout = useLogout();

  return (
    <Button
      variant="ghost"
      loading={logout.isPending || logout.isSuccess}
      onClick={() => {
        if (logout.isPending || logout.isSuccess) return;
        logout.mutate(undefined, { onSuccess: () => router.refresh() });
      }}
    >
      {t("logout")}
    </Button>
  );
}
