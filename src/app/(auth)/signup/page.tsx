import { redirect } from "next/navigation";
import { getCurrentUser } from "@/domains/Auth/shared/server/session";
import { SignUpForm } from "@/domains/Auth/features/sign-up/ui";

export default async function SignUpPage() {
  const user = await getCurrentUser();
  if (user) redirect("/jobs");

  return <SignUpForm />;
}
