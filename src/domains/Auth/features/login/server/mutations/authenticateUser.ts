import "server-only";

import { prisma } from "@/shared/lib/prisma";
import { hashPassword, verifyPassword } from "@/domains/Auth/shared/server/password";
import { createSession } from "@/domains/Auth/shared/server/session";
import type { LoginInput } from "@/domains/Auth/shared/schemas/authSchemas";
import type { CurrentUser } from "@/domains/Auth/shared/types";

export class InvalidCredentialsError extends Error {
  constructor() {
    super("INVALID_CREDENTIALS");
    this.name = "InvalidCredentialsError";
  }
}

// Hash descartável calculado uma única vez, usado para igualar o tempo de
// resposta quando o e-mail não existe (evita enumeração por timing).
let dummyHashPromise: Promise<string> | null = null;
function getDummyHash() {
  return (dummyHashPromise ??= hashPassword("invalid-credentials-placeholder"));
}

export async function authenticateUser(input: LoginInput): Promise<CurrentUser> {
  const user = await prisma.usuarios.findUnique({
    where: { email: input.email },
  });

  // Mensagem genérica: não revela se o e-mail existe. Quando não existe,
  // ainda fazemos um verify (contra um hash dummy) para o tempo ser constante.
  if (!user || !user.senha_hash || !user.ativo) {
    await verifyPassword(await getDummyHash(), input.password);
    throw new InvalidCredentialsError();
  }

  const valid = await verifyPassword(user.senha_hash, input.password);
  if (!valid) throw new InvalidCredentialsError();

  await createSession(user.id);

  return { id: user.id, email: user.email, name: user.nome };
}
