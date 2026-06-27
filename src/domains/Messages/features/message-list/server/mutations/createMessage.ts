import "server-only";

import { prisma } from "@/shared/lib/prisma";
import type { CreateMessageInput } from "../../schemas/messageSchemas";

export function createMessage(input: CreateMessageInput) {
  return prisma.message.create({ data: input });
}
