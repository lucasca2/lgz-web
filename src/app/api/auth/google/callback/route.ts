import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  exchangeCode,
  getBaseUrl,
  hasCalendarScope,
} from "@/shared/lib/google";
import { upsertGoogleUser } from "@/domains/Auth/shared/server/googleUser";
import { createSession } from "@/domains/Auth/shared/server/session";

export async function GET(request: Request) {
  const baseUrl = getBaseUrl(request);
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const cookieStore = await cookies();
  const storedState = cookieStore.get("g_oauth_state")?.value;

  // Always clear the CSRF state cookie, regardless of outcome.
  cookieStore.delete("g_oauth_state");

  if (!storedState || !state || state !== storedState || !code) {
    return NextResponse.redirect(new URL("/login?error=google", baseUrl));
  }

  try {
    const profile = await exchangeCode(baseUrl, code);

    if (!hasCalendarScope(profile.scope)) {
      return NextResponse.redirect(
        new URL("/login?error=calendar_scope", baseUrl),
      );
    }

    const user = await upsertGoogleUser(profile);
    await createSession(user.id);

    return NextResponse.redirect(new URL("/dashboard", baseUrl));
  } catch {
    return NextResponse.redirect(new URL("/login?error=google", baseUrl));
  }
}
