"use client";

import { useTranslations } from "next-intl";
import { Badge, type BadgeVariant } from "@/shared/ui/Badge";
import type { AssessmentStatus } from "../../utils/status";

const variantByStatus: Record<AssessmentStatus, BadgeVariant> = {
  approved: "positive",
  rejected: "negative",
  pending: "warn",
  draft: "neutral",
};

export function StatusBadge({ status }: { status: AssessmentStatus }) {
  const t = useTranslations("Assessments");
  return <Badge variant={variantByStatus[status]}>{t(`status.${status}`)}</Badge>;
}
