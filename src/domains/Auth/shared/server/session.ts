import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { cache } from "react";
import { prisma } from "@/shared/lib/prisma";
import type { CurrentUser } from "../types";

export const SESSION_COOKIE = "session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias

// Guardamos no banco apenas o hash do token; o cookie carrega o token cru.
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function cookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires: expiresAt,
  };
}

// Cria uma nova sessão para o usuário e seta o cookie httpOnly.
// Chamar apenas em Route Handlers / Server Actions (contexto que pode escrever cookie).
export async function createSession(usuarioId: string): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expiraEm = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.sessoes.create({
    data: { id: hashToken(token), usuario_id: usuarioId, expira_em: expiraEm },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, cookieOptions(expiraEm));
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await prisma.sessoes.deleteMany({ where: { id: hashToken(token) } });
  }

  cookieStore.delete(SESSION_COOKIE);
}

// DAL: fonte da verdade da sessão no servidor. Memoizada por request com cache().
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.sessoes.findUnique({
    where: { id: hashToken(token) },
    include: { usuarios: true },
  });

  if (!session) return null;

  if (session.expira_em < new Date()) {
    await prisma.sessoes.deleteMany({ where: { id: session.id } });
    return null;
  }

  return {
    id: session.usuarios.id,
    email: session.usuarios.email,
    name: session.usuarios.nome,
  };
});

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}
