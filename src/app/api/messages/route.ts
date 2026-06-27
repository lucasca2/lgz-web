import { createMessageSchema } from "@/domains/Messages/features/message-list/schemas/messageSchemas";
import { createMessage } from "@/domains/Messages/features/message-list/server/mutations/createMessage";
import { getMessages } from "@/domains/Messages/features/message-list/server/queries/getMessages";

export async function GET() {
  const messages = await getMessages();
  return Response.json(messages);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createMessageSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const message = await createMessage(parsed.data);
  return Response.json(message, { status: 201 });
}
