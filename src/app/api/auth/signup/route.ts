import { signupSchema } from "@/domains/Auth/shared/schemas/authSchemas";
import {
  EmailAlreadyInUseError,
  registerUser,
} from "@/domains/Auth/features/sign-up/server/mutations/registerUser";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const user = await registerUser(parsed.data);
    return Response.json(user, { status: 201 });
  } catch (err) {
    if (err instanceof EmailAlreadyInUseError) {
      return Response.json(
        { error: "E-mail já cadastrado" },
        { status: 409 },
      );
    }
    throw err;
  }
}
