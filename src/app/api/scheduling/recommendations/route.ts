import { requireUser } from "@/domains/Auth/shared/server/session";
import { getParticipantRecommendations } from "@/domains/Scheduling/shared/server";
import type { RecommendationsResponse } from "@/domains/Scheduling/shared/types";

// Recomenda participantes para uma posição com base no histórico de convites.
export async function GET(request: Request) {
  try {
    await requireUser();
  } catch {
    return Response.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const position = (
    new URL(request.url).searchParams.get("position") ?? ""
  ).trim();
  if (!position) {
    return Response.json({ participants: [] } satisfies RecommendationsResponse);
  }

  const participants = await getParticipantRecommendations(position);
  return Response.json({ participants } satisfies RecommendationsResponse);
}
