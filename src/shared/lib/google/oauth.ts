import "server-only";

import type { GoogleProfile, GoogleTokens } from "@/domains/Scheduling/shared/types";
import {
  CALENDAR_SCOPE,
  DIRECTORY_SCOPE,
  GOOGLE_SCOPES,
  getRedirectUri,
  loadGoogleCredentials,
} from "@/shared/lib/google/credentials";

const AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const USERINFO_ENDPOINT = "https://www.googleapis.com/oauth2/v2/userinfo";

// Re-export para conveniência dos callers.
export { CALENDAR_SCOPE, DIRECTORY_SCOPE, GOOGLE_SCOPES };

// Monta a URL de consentimento do Google. access_type=offline + prompt=consent
// garantem o refresh_token (necessário para "agir como" o recrutador depois).
export function buildAuthUrl(baseUrl: string, state?: string): string {
  const { clientId } = loadGoogleCredentials();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getRedirectUri(baseUrl),
    response_type: "code",
    scope: GOOGLE_SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
  });
  if (state) params.set("state", state);
  return `${AUTH_ENDPOINT}?${params.toString()}`;
}

type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
  scope?: string;
  expires_in?: number;
};

type UserinfoResponse = {
  id?: string;
  email?: string;
  name?: string;
  picture?: string;
};

// Troca o authorization code pelo perfil resolvido do usuário (tokens + identidade).
export async function exchangeCode(
  baseUrl: string,
  code: string,
): Promise<GoogleProfile> {
  const { clientId, clientSecret } = loadGoogleCredentials();

  const tokenRes = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: getRedirectUri(baseUrl),
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    const detail = await tokenRes.text().catch(() => "");
    throw new Error(
      `Falha ao trocar o code por tokens (${tokenRes.status}): ${detail}`,
    );
  }

  const token = (await tokenRes.json()) as TokenResponse;
  const accessToken = token.access_token;
  if (!accessToken) {
    throw new Error("Resposta de token sem access_token.");
  }

  const userRes = await fetch(USERINFO_ENDPOINT, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!userRes.ok) {
    const detail = await userRes.text().catch(() => "");
    throw new Error(
      `Falha ao obter userinfo (${userRes.status}): ${detail}`,
    );
  }

  const user = (await userRes.json()) as UserinfoResponse;

  return {
    email: user.email ?? "",
    name: user.name ?? null,
    picture: user.picture ?? null,
    googleId: user.id ?? "",
    refreshToken: token.refresh_token ?? null,
    scope: token.scope ?? "",
  };
}

// Resolve um access_token novo a partir do refresh_token persistido.
export async function refreshAccessToken(
  refreshToken: string,
): Promise<GoogleTokens> {
  const { clientId, clientSecret } = loadGoogleCredentials();

  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Falha ao renovar access_token (${res.status}): ${detail}`,
    );
  }

  const token = (await res.json()) as TokenResponse;

  return {
    accessToken: token.access_token ?? "",
    refreshToken: token.refresh_token ?? null,
    scope: token.scope ?? "",
    expiresIn: token.expires_in ?? 0,
  };
}

// Verifica se o escopo concedido inclui a permissão de Agenda.
export function hasCalendarScope(scope: string): boolean {
  return scope.split(" ").includes(CALENDAR_SCOPE);
}

// Verifica se o escopo concedido inclui a permissão de diretório (People API).
export function hasDirectoryScope(scope: string): boolean {
  return scope.split(" ").includes(DIRECTORY_SCOPE);
}
