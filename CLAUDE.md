@AGENTS.md

# CLAUDE.md

Project: Wave Hackaton — **web** — Next.js 16 + TypeScript + npm
Stack: React Query v5 (data fetching) · Zustand v5 (estado) · Zod v4 (schemas) · next-intl v4 (i18n)
Back-end: Next server (Route Handlers em `app/api`) + Prisma v7 / PostgreSQL

> **i18n:** locales `pt-BR` (default), `en`, `es`. Configuração **sem locale na URL** —
> o idioma é resolvido por cookie (`NEXT_LOCALE`). Config central em `src/i18n/`;
> traduções de domínio podem viver em `domains/[Domain]/shared/messages/`.

---

## Estrutura de pastas

> Usamos `src/`. O alias `@/*` aponta para `./src/*`, então um arquivo em
> `src/domains/Foo/...` é importado como `@/domains/Foo/...`.

```
prisma/                                 # FORA de src/ (convenção do Prisma)
├── schema.prisma                       # datasource (postgresql) + models
└── migrations/
prisma.config.ts                        # config do Prisma CLI (lê DATABASE_URL via dotenv)

src/
├── app/                                # roteamento (App Router) — só wrappers finos
│   ├── [rota]/
│   │   └── page.tsx                    # renderiza só a Screen do domínio
│   └── api/                            # BORDA HTTP do back-end
│       └── [recurso]/
│           └── route.ts                # valida input (Zod) e delega ao server/ do domínio
│
├── generated/prisma/                   # client gerado (gitignored — `prisma generate`)
│
├── i18n/                               # config central de internacionalização
│   ├── config.ts                       # locales + defaultLocale
│   ├── locale.ts                       # get/setUserLocale (cookie)
│   ├── request.ts                      # getRequestConfig do next-intl
│   └── messages/                       # pt-BR.json, en.json, es.json
│
├── domains/
│   └── [Domain]/                       # ex.: Auth, Billing, Products
│       │
│       ├── features/
│       │   └── [feature-name]/         # ex.: product-list, invoice-list
│       │       ├── ui/                 # modais e componentes de form (exclusivos da feature)
│       │       ├── screens/            # List/, Detail/, etc.
│       │       ├── hooks/              # CLIENTE — React Query, falam com /api via fetch
│       │       │   ├── queries/        # useQuery → fetch('/api/...')
│       │       │   └── mutations/      # useMutation → fetch('/api/...')
│       │       ├── server/             # SERVER-ONLY — regra de negócio + Prisma
│       │       │   ├── queries/        # leitura  (prisma.x.findMany) — `import "server-only"`
│       │       │   └── mutations/      # escrita  (prisma.x.create)   — `import "server-only"`
│       │       ├── schemas/            # schemas de filtro + schemas de form (Zod)
│       │       ├── constants/          # específicos da feature (apiRoutes, etc.)
│       │       ├── types/              # request/response types da feature
│       │       └── stores/             # estado local da feature (Zustand)
│       │
│       └── shared/                     # reusado ENTRE features do mesmo domínio
│           ├── ui/
│           ├── hooks/
│           │   ├── queries/
│           │   └── mutations/
│           ├── queryKeys/              # query keys do domínio
│           ├── types/                  # ex.: ProductStatus
│           ├── constants/              # ex.: status mappings
│           ├── utils/
│           └── messages/               # pt-BR.json, en.json, es.json
│
└── shared/                             # primitivas do projeto TODO
    ├── ui/
    ├── hooks/
    ├── utils/
    ├── types/
    ├── schemas/
    ├── providers/                      # QueryProvider, etc.
    └── lib/
        └── prisma/                     # PrismaClient singleton (+ adapter pg)
```

**Camadas:**
- **`app/`** — roteamento + `api/` (borda HTTP do back-end).
- **`i18n/`** — config central do next-intl + mensagens base.
- **`domains/[Domain]/`** — `features/` (cada feature auto-contida) + `shared/` (reuso dentro do domínio).
- **`shared/`** (raiz) — primitivas usadas pelo projeto inteiro.

> Crie só as subpastas que a feature realmente usa. A árvore é o destino, não um
> boilerplate a ser gerado vazio.

---

## Back-end (Next server + Prisma)

O back-end é o próprio Next. Três camadas, do banco até a UI:

```
Client Component
  └─ hook (React Query)  ──fetch──▶  app/api/.../route.ts  ──▶  domains/…/server/  ──▶  Prisma ──▶ DB
                                       (valida c/ Zod)          (regra de negócio,
                                                                 `import "server-only"`)
Server Component (RSC)
  └───────────── importa domains/…/server/ diretamente ──────▶  domains/…/server/  ──▶  Prisma ──▶ DB
                 (sem hop HTTP)
```

- **`server/`** é o núcleo reutilizável (route handlers **e** Server Components chamam ele).
  Nunca importado pelo cliente — proteja com `import "server-only"`.
- **`app/api/.../route.ts`** é fina: faz parse + validação Zod e delega ao `server/`.
- **Zod** (em `schemas/`) valida o request no route handler **e** o form no cliente.
- **`apiRoutes`** (em `constants/`) centraliza os paths `/api/...` que os hooks consomem.
- **Prisma 7** exige driver adapter — usamos `@prisma/adapter-pg`; o client é gerado em
  `src/generated/prisma` (gitignored, regenerado por `prisma generate` no `postinstall`).

Exemplo completo da fatia vertical: `src/domains/Messages/features/message-list/` + `src/app/api/messages/route.ts`.

---

## Regras universais

- **Nunca `export default`** — sempre named exports (exceção: `app/**/page.tsx` e
  `layout.tsx`, onde o Next exige default export).
- **Path alias `@/*`** — nunca `../../` cruzando pastas diferentes.
- **`import type {}`** para imports só de tipo — separado dos imports de valor.
- **`.tsx`** só para arquivos com JSX; o resto é `.ts`.
- **Toda pasta de componente/hook** tem um `index.ts` (barrel export).
- **`import "server-only"`** no topo de tudo em `server/` — garante que Prisma nunca vaze pro client.
- **Prisma** sempre via `import { prisma } from "@/shared/lib/prisma"` — nunca `new PrismaClient()` solto.

---

## Banco de dados (Prisma)

`DATABASE_URL` fica no `.env` (gitignored). Comandos:

```bash
npm run db:migrate      # cria/aplica migration (prisma migrate dev) — precisa do Postgres rodando
npm run db:studio       # abre o Prisma Studio
npx prisma generate     # regenera o client (roda sozinho no postinstall)
```

Ao editar `prisma/schema.prisma`, rode `npm run db:migrate` e o client é regenerado.

---

## Antes de finalizar uma tarefa

```bash
npx tsc --noEmit
npm run build
```

Corrija todos os erros de TypeScript antes de finalizar.

> Ainda não há ESLint nem test runner configurados. Quando forem adicionados,
> incluir `npm run lint` / `npm test` aqui.
