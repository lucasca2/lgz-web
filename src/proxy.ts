import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "session";

// /convite/<id> é a tela pública do candidato (sem login, link single-use).
const PUBLIC_PATHS = ["/login", "/signup", "/convite"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  const hasSession = request.cookies.has(SESSION_COOKIE);

  if (!hasSession && !isPublic) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  if (hasSession && isPublic) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/jobs";
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|woff2?|ttf|otf)).*)",
  ],
};
