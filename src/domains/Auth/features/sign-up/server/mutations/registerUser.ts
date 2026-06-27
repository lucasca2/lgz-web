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
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (existing) throw new EmailAlreadyInUseError();

  const passwordHash = await hashPassword(input.password);

  try {
    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        name: input.name ?? null,
      },
    });

    await createSession(user.id);

    return { id: user.id, email: user.email, name: user.name };
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
