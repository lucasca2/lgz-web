import { prisma } from "@/shared/lib/prisma";
import { bookSchema } from "@/domains/Scheduling/shared/schemas";
import {
  emitInvite,
  isSlotStillFree,
} from "@/domains/Scheduling/shared/server";
import type { BookResponse } from "@/domains/Scheduling/shared/types";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = bookSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { start, email } = parsed.data;

  const link = await prisma.convites_agendamento.findUnique({
    where: { id },
    include: { organizador: { select: { google_refresh_token: true } } },
  });

  if (!link) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }

  // Single-use guard (estado atual; a trava real contra corrida é o updateMany abaixo).
  if (link.status !== "ACTIVE") {
    return Response.json({ error: "consumed" }, { status: 410 });
  }

  const offered = link.slots as string[];
  if (!offered.includes(start)) {
    return Response.json({ error: "invalid_slot" }, { status: 400 });
  }

  const refreshToken = link.organizador?.google_refresh_token;
  if (!refreshToken) {
    return Response.json({ error: "organizer_unavailable" }, { status: 409 });
  }

  const included = link.incluidos as string[];
  const required = link.obrigatorios as string[];

  const check = await isSlotStillFree({
    refreshToken,
    durationMin: link.duracao_min,
    startIso: start,
    included,
    required,
    urgent: link.urgente,
  });
  if (!check.free) {
    return Response.json({ error: "slot_taken" }, { status: 409 });
  }

  // FIRST-mark-then-emit: marca CONSUMED condicionalmente para travar a corrida
  // de double-book. Só quem ganhar a atualização (count === 1) emite o evento.
  const claimed = await prisma.convites_agendamento.updateMany({
    where: { id, status: "ACTIVE" },
    data: {
      status: "CONSUMED",
      consumido_em: new Date(),
      consumido_por_email: email,
      slot_agendado: start,
    },
  });
  if (claimed.count === 0) {
    return Response.json({ error: "consumed" }, { status: 410 });
  }

  // Une convidados + candidato (dedupe).
  const attendees = Array.from(new Set([...included, email]));

  const event = await emitInvite({
    refreshToken,
    title: link.titulo,
    description: link.descricao ?? undefined,
    startIso: start,
    durationMin: link.duracao_min,
    attendees,
    urgent: link.urgente,
    conflicts: check.conflicts,
  });

  await prisma.convites_agendamento.update({
    where: { id },
    data: {
      google_event_id: event.id,
      google_event_link: event.htmlLink,
      google_meet_link: event.meetLink,
    },
  });

  return Response.json({
    ok: true,
    htmlLink: event.htmlLink,
    meetLink: event.meetLink,
    organizer: link.organizador_email,
  } satisfies BookResponse);
}
