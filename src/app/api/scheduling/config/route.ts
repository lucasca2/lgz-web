import { requireUser } from "@/domains/Auth/shared/server/session";
import { schedulingConfig } from "@/domains/Scheduling/shared/constants/config";

export async function GET() {
  try {
    await requireUser();
  } catch {
    return Response.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  return Response.json({
    eventTitle: schedulingConfig.eventTitle,
    defaultDurationMin: schedulingConfig.defaultDurationMin,
    employees: schedulingConfig.employees,
  });
}
