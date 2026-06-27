import { requireUser } from "@/domains/Auth/shared/server/session";
import type { CandidateInviteResponse } from "@/domains/Scheduling/shared/types";
import { getBaseUrl } from "@/shared/lib/google/credentials";
import { prisma } from "@/shared/lib/prisma";

// GET /api/scheduling/candidate-invite?candidateId=<id>
// Convite mais recente atrelado a um candidato do board (para o modal mostrar
// "usuário já tem agendamento" + link do Meet). Exige recrutador autenticado.
export async function GET(request: Request) {
  try {
    await requireUser();
  } catch {
    return Response.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const candidateId = searchParams.get("candidateId")?.trim();
  if (!candidateId) {
    return Response.json({ error: "candidateId_required" }, { status: 400 });
  }

  const invite = await prisma.convites_agendamento.findFirst({
    where: { candidato_ref: candidateId },
    orderBy: { created_at: "desc" },
  });

  if (!invite) {
    return Response.json({
      hasInvite: false,
      status: null,
      inviteUrl: null,
      meetLink: null,
      eventLink: null,
      slot: null,
      candidateEmail: null,
    } satisfies CandidateInviteResponse);
  }

  const baseUrl = getBaseUrl(request);
  return Response.json({
    hasInvite: true,
    status: invite.status,
    inviteUrl: invite.status === "ACTIVE" ? `${baseUrl}/convite/${invite.id}` : null,
    meetLink: invite.google_meet_link,
    eventLink: invite.google_event_link,
    slot: invite.slot_agendado,
    candidateEmail: invite.consumido_por_email,
  } satisfies CandidateInviteResponse);
}
