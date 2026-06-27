import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "session";

// Rotas acessíveis SEM sessão.
// /convite/<id> é a tela pública do candidato (link single-use); ela precisa
// abrir para qualquer um — inclusive um recrutador logado testando o próprio
// link — então NÃO entra na regra de "desviar quem já está logado".
// /oauth/callback é o retorno do OAuth do Google (usuário ainda sem sessão).
const PUBLIC_PATHS = ["/login", "/convite", "/oauth/callback"];

// Páginas de autenticação: quem já tem sessão é mandado para a home (não faz
// sentido ver login logado). Subconjunto de PUBLIC_PATHS.
const AUTH_PAGES = ["/login"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const matches = (paths: string[]) =>
    paths.some((p) => pathname === p || pathname.startsWith(p + "/"));

  const isPublic = matches(PUBLIC_PATHS);
  const isAuthPage = matches(AUTH_PAGES);

  const hasSession = request.cookies.has(SESSION_COOKIE);

  if (!hasSession && !isPublic) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  if (hasSession && isAuthPage) {
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
