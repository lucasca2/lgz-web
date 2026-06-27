import { redirect } from "next/navigation";
import { getCurrentUser } from "@/domains/Auth/shared/server/session";

export default async function NotFound() {
  const user = await getCurrentUser();
  redirect(user ? "/dashboard" : "/login");
}
