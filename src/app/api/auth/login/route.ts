import { loginSchema } from "@/domains/Auth/shared/schemas/authSchemas";
import {
  InvalidCredentialsError,
  authenticateUser,
} from "@/domains/Auth/features/login/server/mutations/authenticateUser";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const user = await authenticateUser(parsed.data);
    return Response.json(user, { status: 200 });
  } catch (err) {
    if (err instanceof InvalidCredentialsError) {
      return Response.json(
        { error: "Credenciais inválidas" },
        { status: 401 },
      );
    }
    throw err;
  }
}
