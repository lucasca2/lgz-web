import { redirect } from "next/navigation";
import { getCurrentUser } from "@/domains/Auth/shared/server/session";
import { LoginForm } from "@/domains/Auth/features/login/ui";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");

  return <LoginForm />;
}
