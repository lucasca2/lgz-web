# Integrações

Registro de todas as integrações externas usadas pelo produto final.

## 1. Google Cloud Platform

- **Projeto:** `my-project-1576264336175` (conta pessoal `zerogamerptbr@gmail.com`).
- **API habilitada:** Google Calendar API.
- **Tela de consentimento OAuth:** publicada em **Produção** (não verificada).
  - Como é app não verificado com escopo confidencial (Calendar), há **limite vitalício de 100 usuários** que podem autorizar (contador cumulativo, não zerável).
  - A tela amarela "App não verificado" continua aparecendo para os usuários (passa por *Avançado → Acessar*). Só some com verificação do Google.
  - Por estar em Produção (e não em Testing), não é necessário cadastrar test users, e os refresh tokens não expiram em 7 dias.

### OAuth Client usado

Foi usado um client do tipo **Aplicativo da Web** (nome "WAVE Web"):

- **client_id:** `930481614532-mqaeadg37fk20et8t9nsusme65atnrde.apps.googleusercontent.com`
- **URIs de redirecionamento autorizados** (cadastrados no client):
  - `https://<DOMINIO_NGROK>/oauth/callback`
  - `http://localhost:3000/oauth/callback`
- O JSON desse client foi salvo localmente como `credentials-web.json`.

> O tipo precisa ser **Web** (não Desktop). O client Desktop não aceita redirect `https` e dá `redirect_uri_mismatch`. As URLs de callback ficam em "URIs de redirecionamento autorizados" (que aceitam caminho), **não** em "Origens JavaScript autorizadas".

> O Google deixou de permitir baixar o secret de um client existente; o `credentials-web.json` foi obtido baixando o JSON **no momento da criação** do client.

## 2. Escopos OAuth solicitados

Definidos em `src/authWeb.ts`:

```
openid
https://www.googleapis.com/auth/userinfo.email
https://www.googleapis.com/auth/calendar
```

- `openid` + `userinfo.email` → usados para descobrir o e-mail de quem logou (via endpoint OAuth2 userinfo).
- `calendar` → leitura das agendas (events.list) e criação de eventos (events.insert).

O consentimento é pedido com `access_type=offline` e `prompt=consent`, garantindo o **refresh token** a cada login. Se o usuário desmarcar a permissão de Agenda no consentimento, o token vem sem o escopo `calendar` e o callback rejeita o login (ver `02-autenticacao.md`).

## 3. ngrok

- Expõe a porta local **3000** numa URL pública `https://<DOMINIO_NGROK>.ngrok-free.app`.
- Necessário para: (a) o candidato externo abrir o link `/convite`; (b) o callback de OAuth voltar para o servidor quando o login é feito pela URL pública.
- O domínio usado durante o desenvolvimento foi `https://fbce-2804-29b8-500a-8d9f-5de9-d5c-23a1-ce50.ngrok-free.app`.
- **No plano free o subdomínio muda a cada restart do ngrok.** Quando muda, três coisas precisam acompanhar: `publicBaseUrl` no `config.json`, o redirect URI no client web do GCP, e o restart do servidor.

## 4. Dependências (npm)

Em uso no produto final (`package.json`):

```json
"dependencies": {
  "express": "^4.21.1",
  "googleapis": "^144.0.0"
},
"devDependencies": {
  "tsx": "^4.19.2",
  "typescript": "^5.6.3",
  "@types/express": "^4.17.21",
  "@types/node": "^22.9.0"
}
```

> `@google-cloud/local-auth` também consta nas dependências, mas só era usado pelos scripts exploratórios — **não** pelo servidor.

Execução: `npm run server` → `tsx src/server.ts`. O TypeScript roda direto via `tsx`; não há passo de compilação.

## 5. Variáveis de ambiente

Lidas em `src/server.ts` e `src/authWeb.ts`:

| Variável | Default | Efeito |
|---|---|---|
| `PORT` | `3000` | Porta do servidor Express |
| `PUBLIC_BASE_URL` | `config.publicBaseUrl` | Base usada para montar a URL dos links e o redirect de OAuth |
| `OAUTH_REDIRECT` | `${BASE_URL}/oauth/callback` | Sobrescreve o redirect de OAuth (foi usado para forçar `http://localhost:3000/oauth/callback` durante testes locais, mantendo os links apontando para o ngrok) |

Exemplo usado em desenvolvimento para logar via localhost mantendo links no ngrok:

```bash
OAUTH_REDIRECT="http://localhost:3000/oauth/callback" npm run server
```

## 6. Fuso horário

Toda a lógica de horário assume **America/Sao_Paulo (UTC-3, sem horário de verão)**, com offset fixo `-03:00` no código, independente do fuso da máquina. Os eventos são criados com `timeZone: "America/Sao_Paulo"`.
