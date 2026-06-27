import { requireUser } from "@/domains/Auth/shared/server/session";
import { getFunilMetrics } from "@/domains/Analytics/features/funil-overview/server/queries/getFunilMetrics";

export async function GET(request: Request) {
  try {
    await requireUser();
  } catch {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const projeto = searchParams.get("projeto") || null;

  const result = await getFunilMetrics(projeto);
  return Response.json(result, { status: 200 });
}
