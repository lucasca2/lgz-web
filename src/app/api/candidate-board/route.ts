import { boardOrderSchema } from "@/domains/Recruitment/features/candidate-board/schemas/boardSchemas";
import { getBoardCards } from "@/domains/Recruitment/features/candidate-board/server/queries/getBoardCards";
import { saveBoardOrder } from "@/domains/Recruitment/features/candidate-board/server/mutations/saveBoardOrder";

export async function GET(request: Request) {
  const vagaId = new URL(request.url).searchParams.get("vagaId") ?? undefined;
  const cards = await getBoardCards(vagaId);
  return Response.json(cards);
}

export async function PUT(request: Request) {
  const vagaId = new URL(request.url).searchParams.get("vagaId") ?? undefined;
  const body = await request.json().catch(() => null);
  const parsed = boardOrderSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const cards = await saveBoardOrder(parsed.data, vagaId);
  return Response.json(cards);
}
