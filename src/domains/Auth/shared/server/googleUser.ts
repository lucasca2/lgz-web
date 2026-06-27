import "server-only";

import type { GoogleProfile } from "@/domains/Scheduling/shared/types";
import { prisma } from "@/shared/lib/prisma";

type UpsertResult = { id: string; email: string; name: string | null };

// Cria/atualiza o usuário a partir do perfil Google resolvido no OAuth.
// Nunca sobrescreve um refresh_token persistido com null (Google só o envia no
// 1º consentimento / prompt=consent).
export async function upsertGoogleUser(
  profile: GoogleProfile,
): Promise<UpsertResult> {
  try {
    const existing = await prisma.usuarios.findUnique({
      where: { email: profile.email },
    });

    if (existing) {
      return updateExisting(existing.id, existing.nome, profile);
    }

    const created = await prisma.usuarios.create({
      data: {
        nome: profile.name ?? profile.email,
        email: profile.email,
        senha_hash: null,
        google_id: profile.googleId,
        picture: profile.picture,
        google_scope: profile.scope,
        google_refresh_token: profile.refreshToken ?? null,
      },
    });
    return { id: created.id, email: created.email, name: created.nome };
  } catch (err) {
    // Corrida de unique constraint (email/google_id criados concorrentemente).
    if (isUniqueViolation(err)) {
      const existing = await prisma.usuarios.findUnique({
        where: { email: profile.email },
      });
      if (existing) {
        return updateExisting(existing.id, existing.nome, profile);
      }
    }
    throw err;
  }
}

async function updateExisting(
  id: string,
  currentNome: string | null,
  profile: GoogleProfile,
): Promise<UpsertResult> {
  // Mantém o nome existente se não-vazio; senão usa o do perfil.
  const nome =
    currentNome && currentNome.length > 0
      ? currentNome
      : (profile.name ?? currentNome);

  const updated = await prisma.usuarios.update({
    where: { id },
    data: {
      google_id: profile.googleId,
      picture: profile.picture,
      google_scope: profile.scope,
      ativo: true,
      nome: nome ?? profile.email,
      // Só grava o refresh_token quando veio um novo (truthy).
      ...(profile.refreshToken
        ? { google_refresh_token: profile.refreshToken }
        : {}),
    },
  });

  return { id: updated.id, email: updated.email, name: updated.nome };
}

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === "P2002"
  );
}
