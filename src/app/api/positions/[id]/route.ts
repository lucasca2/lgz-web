import { createPositionSchema } from "@/domains/Positions/features/position-list/schemas/positionSchemas";
import { updatePosition } from "@/domains/Positions/features/position-list/server/mutations/updatePosition";

export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = createPositionSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const position = await updatePosition(id, parsed.data);
  if (!position) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json(position);
}
