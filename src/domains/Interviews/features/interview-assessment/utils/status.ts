import type { Decision } from "../types";

export type AssessmentStatus = "approved" | "rejected" | "pending" | "draft";

// Deriva o status de ciclo de vida a partir da decisão + presença de análise.
export function statusOf(item: {
  decision: Decision | null;
  hasAnalysis: boolean;
}): AssessmentStatus {
  if (item.decision === "APROVAR") return "approved";
  if (item.decision === "REPROVAR") return "rejected";
  if (item.hasAnalysis) return "pending";
  return "draft";
}
