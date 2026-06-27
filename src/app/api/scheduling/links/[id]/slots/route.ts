import { prisma } from "@/shared/lib/prisma";
import { revalidateOfferedSlots } from "@/domains/Scheduling/shared/server";
import type { LinkSlotsResponse } from "@/domains/Scheduling/shared/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const link = await prisma.convites_agendamento.findUnique({
    where: { id },
    include: { organizador: { select: { google_refresh_token: true } } },
  });

  if (!link) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }

  if (link.status !== "ACTIVE") {
    return Response.json({
      title: link.titulo,
      duration: link.duracao_min,
      requested: (link.slots as string[]).length,
      available: 0,
      slots: [],
      consumed: true,
    } satisfies LinkSlotsResponse);
  }

  const refreshToken = link.organizador?.google_refresh_token;
  if (!refreshToken) {
    return Response.json({ error: "organizer_unavailable" }, { status: 409 });
  }

  const offered = link.slots as string[];
  const included = link.incluidos as string[];
  const required = link.obrigatorios as string[];

  const slots = await revalidateOfferedSlots({
    refreshToken,
    durationMin: link.duracao_min,
    offeredIso: offered,
    included,
    required,
    urgent: link.urgente,
  });

  return Response.json({
    title: link.titulo,
    duration: link.duracao_min,
    requested: offered.length,
    available: slots.length,
    slots,
  } satisfies LinkSlotsResponse);
}
