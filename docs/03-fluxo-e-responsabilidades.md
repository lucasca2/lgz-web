# Fluxo e Responsabilidades

Descreve a responsabilidade de cada parte do backend e o passo a passo dos dois fluxos.

## Responsabilidades por módulo

| Parte | Responsabilidade |
|---|---|
| `src/authWeb.ts` | OAuth de baixo nível (URL de consentimento, troca de code, cliente a partir de refresh token). Sem estado. |
| `src/server.ts` | Servir as telas, autenticar, ler agendas, calcular disponibilidade, gerar/guardar links e criar invites. |
| `config.json` | Parâmetros fixos: título, base URL, janela comercial (09–18), granularidade (15 min), lista padrão de pessoas. |
| `tokens.json` | Refresh tokens por e-mail (permite agir como cada usuário). |
| `links.json` | Links gerados e seus parâmetros (incluindo o organizador). |
| `public/*.html` | Frontend das duas telas (consomem a API por `fetch`). |

## Conceitos centrais

### Horário comercial e fuso
- Janela definida em `config.json`: `businessStartHour` (9) a `businessEndHour` (18).
- Granularidade dos horários de início: `stepMin` (15 min).
- Fuso fixo `America/Sao_Paulo` (offset `-03:00`). Helpers no servidor convertem epoch ms ↔ string SP (`fmtSP`, `isoSP`, `hhmm`, `dateSP`).

### Semana exibida e paginação
- A base é a **próxima semana comercial**: `mondayOf(nowSP())` + 7 dias.
- `weekOffset` (≥ 0) avança semanas para frente: `Monday + (7 + weekOffset*7)`.
- Sempre 5 dias (segunda a sexta).

### Ocupação (busy)
- `fetchBusy()` usa `calendar.events.list` (`singleEvents: true`) e marca como ocupado, ignorando:
  - eventos `cancelled`;
  - eventos `transparency: "transparent"` (marcados como "Livre");
  - eventos que a própria pessoa **recusou** (`responseStatus === "declined"`).
  - Eventos de **dia inteiro** ocupam o dia todo.
- `mergeBusy()` funde intervalos sobrepostos. `anyBusy()` testa conflito num slot; `conflictsAt()` retorna quem está ocupado num slot.

### Obrigatório, opcional e urgência (regra de disponibilidade)
A flag de **urgência** decide quem "trava" o horário:

- **Urgência OFF:** o horário precisa estar livre para **todos os incluídos** (obrigatórios e opcionais contam igual). `constraint = included`.
- **Urgência ON:** só os **obrigatórios** precisam estar livres; os opcionais são ignorados na busca. `constraint = required`; `optionals = included − required`.

Em modo urgência, os horários que só existem **porque um opcional foi ignorado** são marcados (`urgentOnly: true`, com a lista `conflicts` dos opcionais em conflito). Horários livres para todos ficam `urgentOnly: false`.

### Emissão do invite
- O evento é criado com `events.insert` em `calendarId: "primary"` da conta **organizadora** (o recrutador que gerou o link), com `sendUpdates: "all"` (dispara e-mails).
- **Convidados** (`attendees`): todos os `included` + o e-mail informado pelo candidato, todos como participantes normais (opcionais **não** entram como `optional`).
- **Sinalização de urgência:** se for urgente e houver opcional em conflito real no horário, o evento sai com título `🔴 [URGENTE] <título>`, `colorId: "11"` (vermelho/Tomate) e uma nota na descrição listando os opcionais ignorados. Sem conflito real, sai como evento normal.

## Fluxo 1 — Recrutador (gera o link)

1. Abre `/` → o frontend chama `GET /api/me`. Sem sessão → mostra "Entrar com Google" (`/login`).
2. Após login, carrega `GET /api/config` (lista padrão de pessoas + duração padrão).
3. Ajusta participantes (incluir / obrigatório), duração e urgência.
4. Clica "Buscar horários" → `GET /api/slots?weekOffset&duration&urgent&included&required`.
   - O servidor lê as agendas **como o recrutador logado**, calcula a semana e devolve os slots por dia (com `urgentOnly`/`conflicts`).
5. Seleciona horários na grade (toggle) e clica "Gerar link" → `POST /api/links`.
   - O servidor grava em `links.json` um registro com `organizer = <recrutador logado>`, os participantes, urgência, duração e os horários selecionados; retorna `{ id, url }`.
6. O recrutador copia a URL (`<base>/convite?id=<id>`) e envia ao candidato.

## Fluxo 2 — Candidato (agenda)

1. Abre `<base>/convite?id=<id>` → `GET /api/links/:id/slots`.
   - O servidor lê as agendas **como o organizador do link** e **revalida** cada horário ofertado contra a disponibilidade atual.
   - Horários que ficaram ocupados **somem**; a resposta informa `requested` vs `available`.
2. Informa o e-mail (pode ser externo) e escolhe um horário → `POST /api/links/:id/book`.
   - O servidor valida que o horário faz parte do link, que não passou, e **re-checa** a disponibilidade no momento (corrida entre abrir a página e confirmar).
   - Cria o evento como o organizador, convidando todos os incluídos + o e-mail do candidato, e retorna o `htmlLink`.

## Ciclo de vida de um link

- Criado no `POST /api/links` com um `id` curto (`Date.now().toString(36) + random`).
- Persistido em `links.json` (sobrevive a restart).
- Consumido por `GET /api/links/:id/slots` (listagem revalidada) e `POST /api/links/:id/book` (agendamento).
- Não há expiração nem remoção automática implementada; um link continua válido enquanto o registro existir e o token do organizador estiver salvo.
