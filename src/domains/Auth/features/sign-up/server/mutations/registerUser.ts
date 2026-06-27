import "server-only";

import { prisma } from "@/shared/lib/prisma";
import { hashPassword } from "@/domains/Auth/shared/server/password";
import { createSession } from "@/domains/Auth/shared/server/session";
import type { SignupInput } from "@/domains/Auth/shared/schemas/authSchemas";
import type { CurrentUser } from "@/domains/Auth/shared/types";

export class EmailAlreadyInUseError extends Error {
  constructor() {
    super("EMAIL_IN_USE");
    this.name = "EmailAlreadyInUseError";
  }
}

export async function registerUser(input: SignupInput): Promise<CurrentUser> {
  const senhaHash = await hashPassword(input.password);

  const existing = await prisma.usuarios.findUnique({
    where: { email: input.email },
  });

  if (existing) {
    if (existing.senha_hash) throw new EmailAlreadyInUseError();

    const user = await prisma.usuarios.update({
      where: { id: existing.id },
      data: { senha_hash: senhaHash, nome: input.name, ativo: true },
    });
    await createSession(user.id);
    return { id: user.id, email: user.email, name: user.nome };
  }

  try {
    const user = await prisma.usuarios.create({
      data: {
        nome: input.name,
        email: input.email,
        senha_hash: senhaHash,
      },
    });

    await createSession(user.id);

    return { id: user.id, email: user.email, name: user.nome };
  } catch (err) {
    // Backstop para corrida na constraint @unique do e-mail.
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code?: string }).code === "P2002"
    ) {
      throw new EmailAlreadyInUseError();
    }
    throw err;
  }
}
