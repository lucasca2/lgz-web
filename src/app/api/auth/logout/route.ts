import { deleteSession } from "@/domains/Auth/shared/server/session";

export async function POST() {
  await deleteSession();
  return new Response(null, { status: 204 });
}
