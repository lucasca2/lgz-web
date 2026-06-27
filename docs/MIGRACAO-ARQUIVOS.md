# Migração — Arquivos a levar para o outro repositório

Lista do que precisa ir para o repositório de destino, o que **não** levar, e os ajustes pós-migração. Foco especial nas credenciais.

## ✅ Código e configuração (levar)

| Arquivo | Observação |
|---|---|
| `src/server.ts` | Servidor + toda a lógica do produto |
| `src/authWeb.ts` | OAuth web multiusuário |
| `public/index.html` | Tela do recrutador |
| `public/candidate.html` | Tela do candidato |
| `config.json` | Ajustar valores (ver abaixo) |
| `tsconfig.json` | Config do TypeScript |
| `package.json` | Trazer só o necessário (ver abaixo) |

Do `package.json`, o que o produto usa de fato:
- dependencies: `express`, `googleapis`
- devDependencies: `tsx`, `typescript`, `@types/express`, `@types/node`
- script: `"server": "tsx src/server.ts"`

> `@google-cloud/local-auth` e os scripts `list`/`freebusy`/`invite`/`invite:oauth`/`slot` **não** precisam ir.

## 🔐 Credenciais (levar com cuidado — nunca commitar)

| Arquivo | O que é | Vai para o repo? |
|---|---|---|
| `credentials-web.json` | OAuth client **Web** (client_id + secret + redirect URIs) | **Sim, é obrigatório**, mas transferir de forma segura (não commitar; manter no `.gitignore` / usar secret manager) |

- Sem `credentials-web.json` o login não funciona.
- Esse arquivo está atrelado ao OAuth client do projeto `my-project-1576264336175`. Pode ser reusado **se** os mesmos redirect URIs forem mantidos/registrados (ver "Ajustes pós-migração").
- Alternativa recomendada: criar um **novo OAuth client Web** no projeto/Workspace de destino e gerar um novo `credentials-web.json` lá.

## ♻️ Dados de runtime (NÃO levar — regenerar no destino)

| Arquivo | Por quê não levar |
|---|---|
| `tokens.json` | Contém refresh tokens dos usuários (sensível). São recriados quando cada um faz login no ambiente novo. Como o redirect URI muda por host, o mais limpo é relogar no destino. |
| `links.json` | Links gerados no ambiente antigo; começam vazios no destino (`{}`). |

## 🚫 Não levar (não fazem parte do produto)

Eram etapas de exploração/teste, sem uso no fluxo final:
- `src/auth.ts` (service account), `src/authOAuth.ts`
- `src/listAgenda.ts`, `src/freeBusy.ts`, `src/createInvite.ts`
- `src/createInviteOAuth.ts`, `src/findSlotAndInvite.ts`
- `credentials.json` (client **Desktop**) — o produto usa o client **Web** (`credentials-web.json`)
- `service-account.json` — abordagem de service account foi descartada
- `token-oauth.json`, `token.json` — tokens dos scripts antigos

## ⚙️ Ajustes pós-migração (obrigatórios)

1. **OAuth client / redirect URIs:** no GCP, cadastrar a URL de callback do ambiente novo:
   - `https://<NOVO_HOST>/oauth/callback` (e/ou `http://localhost:3000/oauth/callback` para dev).
   - Se criar client novo no destino, baixar o JSON e salvar como `credentials-web.json`.
2. **`config.json` → `publicBaseUrl`:** apontar para o host público do destino (ou usar a env `PUBLIC_BASE_URL`).
3. **`config.json` → `employees`, `eventTitle`, janela comercial:** revisar para o contexto do destino.
4. **Tela de consentimento OAuth:** garantir que o projeto/Workspace do destino permita os usuários (em Produção, ou Internal no Workspace, ou test users em Testing). Escopos: `openid`, `userinfo.email`, `calendar`.
5. **Variáveis de ambiente** (opcionais): `PORT`, `PUBLIC_BASE_URL`, `OAUTH_REDIRECT`.
6. **`.gitignore`:** garantir que `credentials-web.json`, `credentials.json`, `tokens.json`, `service-account.json` e `token*.json` estejam ignorados.

## 🔄 Sequência mínima para rodar no destino

1. Copiar código + `config.json` + `credentials-web.json`.
2. `npm install` (com as deps necessárias).
3. Cadastrar o redirect URI do destino no OAuth client.
4. Ajustar `publicBaseUrl`/env.
5. `npm run server` → cada recrutador faz login (gera `tokens.json`), e o fluxo passa a funcionar.

## Resumo: o essencial em uma linha

Leve **`src/server.ts`, `src/authWeb.ts`, `public/index.html`, `public/candidate.html`, `config.json`, `tsconfig.json`, as 6 dependências do `package.json`** e, com transferência segura, **`credentials-web.json`**. Regenere `tokens.json` e `links.json` no destino. Não leve os scripts antigos nem `credentials.json`/`service-account.json`.
