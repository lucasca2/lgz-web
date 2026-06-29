import { requireUser } from "@/domains/Auth/shared/server/session";
import { schedulingConfig } from "@/domains/Scheduling/shared/constants/config";
import { createLinkSchema } from "@/domains/Scheduling/shared/schemas";
import type { CreateLinkResponse } from "@/domains/Scheduling/shared/types";
import { getBaseUrl } from "@/shared/lib/google/credentials";
import { prisma } from "@/shared/lib/prisma";

export async function POST(request: Request) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return Response.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createLinkSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const id =
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

  await prisma.convites_agendamento.create({
    data: {
      id,
      organizador_id: user.id,
      organizador_email: user.email,
      titulo: parsed.data.title ?? schedulingConfig.eventTitle,
      descricao: parsed.data.description,
      duracao_min: parsed.data.duration,
      urgente: parsed.data.urgent,
      incluidos: parsed.data.included,
      obrigatorios: parsed.data.required,
      slots: parsed.data.slots,
      candidato_ref: parsed.data.candidateId,
      // Normaliza a posição (minúsculas) p/ casar nas recomendações futuras.
      posicao: parsed.data.position?.toLowerCase(),
    },
  });

  const baseUrl = getBaseUrl(request);
  return Response.json(
    {
      id,
      url: `${baseUrl}/convite/${id}`,
      organizer: user.email,
    } satisfies CreateLinkResponse,
    { status: 201 },
  );
}
