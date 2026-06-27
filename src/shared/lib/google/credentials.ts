import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";

// Escopos OAuth solicitados (porte do authWeb.ts documentado):
// openid + userinfo.email → descobrir o e-mail/identidade de quem logou.
// userinfo.profile → nome e avatar.
// calendar → ler agendas (events.list) e criar eventos (events.insert).
export const GOOGLE_SCOPES = [
  "openid",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/calendar",
];

// Usado para validar se a permissão de Agenda foi concedida.
export const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar";

export type GoogleCredentials = {
  clientId: string;
  clientSecret: string;
};

type RawKey = {
  client_id?: string;
  client_secret?: string;
  redirect_uris?: string[];
};

let cached: GoogleCredentials | null = null;

// Carrega as credenciais do OAuth client (tipo Web). Prefere variáveis de
// ambiente; cai em credentials-web.json (ou credentials.json) na raiz do repo.
// Lança erro claro se nada for encontrado.
export function loadGoogleCredentials(): GoogleCredentials {
  if (cached) return cached;

  const envId = process.env.GOOGLE_CLIENT_ID;
  const envSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (envId && envSecret) {
    cached = { clientId: envId, clientSecret: envSecret };
    return cached;
  }

  for (const file of ["credentials-web.json", "credentials.json"]) {
    try {
      const raw = JSON.parse(
        readFileSync(path.join(process.cwd(), file), "utf8"),
      ) as { web?: RawKey; installed?: RawKey };
      const key = raw.web ?? raw.installed;
      if (key?.client_id && key?.client_secret) {
        cached = { clientId: key.client_id, clientSecret: key.client_secret };
        return cached;
      }
    } catch {
      // arquivo ausente/ilegível — tenta o próximo
    }
  }

  throw new Error(
    "Credenciais do Google OAuth não encontradas. Defina GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET ou coloque credentials-web.json na raiz do projeto.",
  );
}

// Base URL pública usada para montar o redirect de OAuth e a URL dos links.
// Prioriza PUBLIC_BASE_URL; senão deriva dos headers (atrás de proxy/ngrok);
// por fim cai na origin do request.
export function getBaseUrl(request: Request): string {
  if (process.env.PUBLIC_BASE_URL) return process.env.PUBLIC_BASE_URL;

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (host) {
    const proto = request.headers.get("x-forwarded-proto") ?? "https";
    return `${proto}://${host}`;
  }

  return new URL(request.url).origin;
}

// Redirect URI do callback de OAuth. Precisa bater EXATAMENTE com um URI
// cadastrado no OAuth client do GCP.
export function getRedirectUri(baseUrl: string): string {
  return process.env.GOOGLE_OAUTH_REDIRECT ?? `${baseUrl}/oauth/callback`;
}
