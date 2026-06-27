# WAVE Scheduler — Visão Geral

Documentação da lógica construída para ser migrada para outro repositório. Descreve **o que foi implementado** no produto final (não é um guia de "como fazer", e sim o registro do que existe).

## O que o sistema faz

Um agendador de reuniões integrado ao Google Calendar, com **dois fluxos**:

1. **Recrutador** (autenticado via Google): escolhe participantes (e quem é obrigatório/opcional), define duração e urgência, vê os horários livres na agenda das pessoas, **seleciona** os horários que quer oferecer e **gera um link**.
2. **Candidato** (público, sem login): abre o link, vê **apenas os horários ainda livres** (revalidados na hora contra as agendas), informa o e-mail e o convite é criado e enviado.

O convite é sempre emitido **na agenda do recrutador que gerou o link** (ele é o organizador). Cada recrutador que faz login emite com a própria conta (modelo multiusuário).

## Stack

- **Runtime:** Node.js + TypeScript, executado direto com `tsx` (não há etapa de build/transpile separada).
- **Servidor:** Express.
- **Integração Google:** biblioteca `googleapis` (Google Calendar API v3 + OAuth2 + OAuth2 userinfo).
- **Exposição pública:** ngrok (túnel HTTP para a porta local 3000), necessário para o candidato externo acessar o link e para o callback de OAuth.

## Arquivos que compõem o produto final

| Arquivo | Papel |
|---|---|
| `src/server.ts` | Servidor Express: auth, endpoints de slots/links/book, lógica de disponibilidade e criação de invite |
| `src/authWeb.ts` | Fluxo OAuth web (gerar URL de consentimento, trocar code por token, recriar cliente a partir do refresh token) |
| `public/index.html` | Tela do recrutador (seleção de participantes/horários e geração de link) |
| `public/candidate.html` | Tela do candidato (servida em `/convite`) |
| `config.json` | Configuração: título do evento, base URL pública, janela comercial, granularidade, lista padrão de pessoas |
| `credentials-web.json` | Credenciais do OAuth client tipo **Web** (client_id + secret + redirect URIs) — **sensível** |
| `tokens.json` | Store em disco dos refresh tokens por e-mail (gerado em runtime) — **sensível** |
| `links.json` | Store em disco dos links gerados (gerado em runtime) |
| `package.json` / `tsconfig.json` | Dependências e config do TypeScript |

> O script de entrada usado é `npm run server` (= `tsx src/server.ts`). Os demais scripts em `package.json` (`list`, `freebusy`, `invite`, `invite:oauth`, `slot`) e seus módulos (`auth.ts`, `authOAuth.ts`, etc.) foram etapas de exploração e **não fazem parte do produto final** — não estão documentados aqui.

## Documentos desta pasta

- `01-integracoes.md` — Google Cloud, OAuth, escopos, ngrok, dependências, variáveis de ambiente.
- `02-autenticacao.md` — fluxo de login multiusuário, store de tokens e sessões.
- `03-fluxo-e-responsabilidades.md` — responsabilidade de cada parte e o passo a passo dos dois fluxos.
- `04-telas.md` — o que cada tela mostra e quais chamadas faz.
- `05-contratos-api-e-dados.md` — formato de cada endpoint e dos arquivos de dados.
- `MIGRACAO-ARQUIVOS.md` — quais arquivos levar para o outro repositório (com destaque para credenciais).
