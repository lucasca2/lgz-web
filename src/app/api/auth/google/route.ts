import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { buildAuthUrl, getBaseUrl } from "@/shared/lib/google";

export async function GET(request: Request) {
  const state = randomBytes(16).toString("hex");

  const cookieStore = await cookies();
  cookieStore.set("g_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
    secure: process.env.NODE_ENV === "production",
  });

  const baseUrl = getBaseUrl(request);
  const url = buildAuthUrl(baseUrl, state);

  return NextResponse.redirect(url);
}
