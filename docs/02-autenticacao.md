# Autenticação (OAuth Web Multiusuário)

Descreve como o login foi implementado. Cada recrutador autentica com a própria conta Google; os convites são emitidos na agenda de quem está logado. O candidato **não** loga.

## Módulo `src/authWeb.ts`

Responsável por toda a interação OAuth de baixo nível. Não tem estado; só constrói clientes e URLs.

- **`loadKey()`** — carrega as credenciais do OAuth client. Prefere `credentials-web.json`; se não existir, cai em `credentials.json`. Usa `raw.web || raw.installed`.
- **`getRedirectUri(baseUrl)`** — retorna `process.env.OAUTH_REDIRECT || \`${baseUrl}/oauth/callback\``.
- **`authUrl(baseUrl, state?)`** — gera a URL de consentimento do Google:
  ```ts
  client.generateAuthUrl({ access_type: "offline", prompt: "consent", scope: SCOPES, state })
  ```
- **`exchangeCode(baseUrl, code)`** — troca o `code` do callback por tokens, consulta o e-mail do usuário e retorna `{ email, refreshToken, scope }`:
  ```ts
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);
  const me = await google.oauth2({ version: "v2", auth: client }).userinfo.get();
  return { email: me.data.email, refreshToken: tokens.refresh_token, scope: tokens.scope ?? "" };
  ```
- **`clientFromRefresh(baseUrl, refreshToken)`** — recria um `OAuth2Client` autenticado a partir de um refresh token salvo (usado para agir "como" um usuário sem ele estar na sessão).
- **`CALENDAR_SCOPE`** — constante `https://www.googleapis.com/auth/calendar`, usada para validar se a permissão de Agenda foi concedida.

## Stores

### `tokens.json` (refresh tokens por e-mail) — persistido
```json
{ "fulano@bemobi.com": { "refresh_token": "1//0g..." } }
```
- Lido no boot do servidor; gravado a cada login bem-sucedido (`saveTokens()`).
- É a partir daqui que o servidor consegue agir como qualquer usuário que já logou (inclusive para emitir invites de links antigos).
- **Sensível** (contém refresh tokens). Está no `.gitignore`.

### Sessões (em memória) — **não** persistido
```ts
const sessions = new Map<string, string>(); // sid -> email
```
- Mapa `session id → e-mail`. Criado a cada login; perdido no restart do servidor (após restart, o usuário precisa logar de novo, mas isso só recria a sessão; o token continua salvo).
- O `sid` é gerado com `randomUUID()` e enviado num cookie `HttpOnly; Path=/; SameSite=Lax`.
- `parseCookies(req)` lê o cookie; `currentEmail(req)` resolve o e-mail logado.

## Fluxo de login (endpoints em `src/server.ts`)

1. **`GET /login`** → `res.redirect(authUrl(BASE_URL))` (manda para o consentimento Google).
2. **`GET /oauth/callback?code=...`**:
   - `exchangeCode()` troca o code e obtém `{ email, refreshToken, scope }`.
   - **Guard de escopo:** se `scope` não inclui `CALENDAR_SCOPE`, responde **403** com uma página HTML pedindo para logar de novo mantendo a permissão de Agenda marcada (não salva token).
   - Se o escopo está ok: salva `tokens[email] = { refresh_token }`, cria sessão (`sid → email`), seta o cookie e redireciona para `/`.
3. **`GET /logout`** → remove a sessão do mapa e expira o cookie.
4. **`GET /api/me`** → retorna `{ email }` se logado, ou **401**.

## Como o servidor "age como" um usuário

```ts
function calendarForEmail(email: string): calendar_v3.Calendar {
  const tok = tokens[email];
  if (!tok?.refresh_token) throw new Error(`Usuario ${email} nao autenticado...`);
  return google.calendar({ version: "v3", auth: clientFromRefresh(BASE_URL, tok.refresh_token) });
}
```

- **Recrutador navegando horários** (`/api/slots`) → usa `calendarForEmail(<e-mail da sessão>)`.
- **Candidato** (`/api/links/:id/slots` e `/api/links/:id/book`) → usa `calendarForEmail(link.organizer)`, ou seja, age como o recrutador que gerou o link. Por isso o candidato não precisa logar.

## Tratamento de "Insufficient Permission"

Se um token salvo não tiver o escopo de Calendar (usuário desmarcou a Agenda no consentimento), as chamadas de Calendar retornam `insufficientPermissions`. Em `/api/slots`, esse caso é detectado e retorna **403** com `{ error, relogin: true }`, orientando o usuário a sair e logar de novo mantendo a permissão. O guard no `/oauth/callback` evita salvar tokens sem o escopo logo de entrada.

## Observações de segurança/limitações

- Sessões em memória: restart do servidor desloga todo mundo (mas não apaga tokens).
- O cookie de sessão é `HttpOnly` e `SameSite=Lax`, sem `Secure` (funciona em `http://localhost` e via ngrok).
- O redirect de OAuth precisa bater **exatamente** com um URI cadastrado no client web; muda conforme o host (localhost vs ngrok vs domínio de produção).
