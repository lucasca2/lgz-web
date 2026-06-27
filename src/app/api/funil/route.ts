import { requireUser } from "@/domains/Auth/shared/server/session";
import { getFunilMetrics } from "@/domains/Analytics/features/funil-overview/server/queries/getFunilMetrics";

export async function GET() {
  try {
    await requireUser();
  } catch {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const result = await getFunilMetrics();
  return Response.json(result, { status: 200 });
}
