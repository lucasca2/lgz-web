import { boardOrderSchema } from "@/domains/Recruitment/features/candidate-board/schemas/boardSchemas";
import { getBoardCards } from "@/domains/Recruitment/features/candidate-board/server/queries/getBoardCards";
import { saveBoardOrder } from "@/domains/Recruitment/features/candidate-board/server/mutations/saveBoardOrder";

export async function GET() {
  const cards = await getBoardCards();
  return Response.json(cards);
}

export async function PUT(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = boardOrderSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const cards = await saveBoardOrder(parsed.data);
  return Response.json(cards);
}
