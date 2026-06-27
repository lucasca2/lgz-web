import { requireUser } from "@/domains/Auth/shared/server/session";
import { buildSlotsForRecruiter } from "@/domains/Scheduling/shared/server";
import { slotsQuerySchema } from "@/domains/Scheduling/shared/schemas";
import { prisma } from "@/shared/lib/prisma";

export async function GET(request: Request) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return Response.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const parsed = slotsQuerySchema.safeParse(
    Object.fromEntries(new URL(request.url).searchParams),
  );
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const u = await prisma.usuarios.findUnique({
    where: { id: user.id },
    select: { google_refresh_token: true },
  });
  if (!u?.google_refresh_token) {
    return Response.json({ error: "google_not_connected" }, { status: 409 });
  }

  const { weekOffset, duration, urgent, included, required } = parsed.data;

  try {
    const data = await buildSlotsForRecruiter({
      refreshToken: u.google_refresh_token,
      weekOffset,
      durationMin: duration,
      included,
      required,
      urgent,
    });
    return Response.json(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    if (message.toLowerCase().includes("insufficient")) {
      return Response.json(
        { error: "insufficient_scope", relogin: true },
        { status: 403 },
      );
    }
    throw e;
  }
}
