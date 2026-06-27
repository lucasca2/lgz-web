import { createPositionSchema } from "@/domains/Positions/features/position-list/schemas/positionSchemas";
import { createPosition } from "@/domains/Positions/features/position-list/server/mutations/createPosition";
import { getPositions } from "@/domains/Positions/features/position-list/server/queries/getPositions";

export async function GET() {
  const positions = await getPositions();
  return Response.json(positions);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = createPositionSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const position = await createPosition(parsed.data);
  return Response.json(position, { status: 201 });
}
