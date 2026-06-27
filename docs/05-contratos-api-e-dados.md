# Contratos de API e Formato dos Dados

Registro dos endpoints (request/response) e do formato dos arquivos de dados.

## Endpoints

Todas as respostas são JSON, exceto as páginas HTML (`/`, `/convite`, `/oauth/callback` em erro).

### Autenticação
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/login` | — | Redireciona para o consentimento Google |
| GET | `/oauth/callback?code=...` | — | Recebe o code, salva token, cria sessão, redireciona `/` |
| GET | `/logout` | — | Encerra a sessão |
| GET | `/api/me` | cookie | `200 { email }` ou `401` |

### `GET /api/config`
Resposta:
```json
{
  "eventTitle": "Reunião Bemobi",
  "defaultDurationMin": 30,
  "employees": [{ "email": "natan.lucena@bemobi.com", "required": true }]
}
```

### `GET /api/slots` (recrutador, requer sessão)
Query params:
- `weekOffset` (int ≥ 0; 0 = próxima semana comercial)
- `duration` (minutos)
- `urgent` (`true`/`false`)
- `included` (e-mails separados por vírgula)
- `required` (e-mails separados por vírgula)

Resposta:
```json
{
  "weekOffset": 0,
  "duration": 30,
  "days": [
    {
      "date": "2026-06-29",
      "slots": [
        { "start": "2026-06-29T13:30:00-03:00", "label": "13:30", "urgentOnly": false, "conflicts": [] },
        { "start": "2026-06-29T14:30:00-03:00", "label": "14:30", "urgentOnly": true, "conflicts": ["alonso.almeida@bemobi.com"] }
      ]
    }
  ]
}
```
Erros: `401` (sem login), `400` (duração inválida), `403 { error, relogin: true }` (token sem escopo de Agenda).

### `POST /api/links` (recrutador, requer sessão)
Body:
```json
{
  "included": ["natan.lucena@bemobi.com", "lucas.amaral@bemobi.com"],
  "required": ["natan.lucena@bemobi.com"],
  "urgent": false,
  "duration": 30,
  "slots": ["2026-06-29T13:30:00-03:00", "2026-06-29T17:30:00-03:00"],
  "title": "Reunião Bemobi"
}
```
Resposta:
```json
{ "id": "mqwj9jfzs7nmh", "url": "https://<base>/convite?id=mqwj9jfzs7nmh", "organizer": "natan.lucena@bemobi.com" }
```
O `organizer` é definido pelo servidor a partir da sessão (não vem do body).

### `GET /api/links/:id/slots` (candidato, público)
Revalida os horários do link contra as agendas (como o organizador). Resposta:
```json
{
  "title": "Reunião Bemobi",
  "duration": 30,
  "requested": 2,
  "available": 1,
  "slots": [
    { "start": "2026-06-29T13:30:00-03:00", "label": "13:30", "date": "2026-06-29", "urgentOnly": false, "conflicts": [] }
  ]
}
```
Erro: `404` (link não encontrado).

### `POST /api/links/:id/book` (candidato, público)
Body:
```json
{ "start": "2026-06-29T13:30:00-03:00", "email": "candidato@gmail.com" }
```
Resposta:
```json
{
  "ok": true,
  "htmlLink": "https://www.google.com/calendar/event?eid=...",
  "organizer": "natan.lucena@bemobi.com",
  "urgent": false,
  "ignoredOptionals": []
}
```
Erros: `404` (link), `400` (faltou campo / horário fora do link), `409` (horário já passou ou ficou indisponível na re-checagem).

## Arquivos de dados

### `config.json`
```json
{
  "eventTitle": "Reunião Bemobi",
  "publicBaseUrl": "https://<DOMINIO_NGROK>.ngrok-free.app",
  "defaultDurationMin": 30,
  "businessStartHour": 9,
  "businessEndHour": 18,
  "stepMin": 15,
  "employees": [
    { "email": "natan.lucena@bemobi.com", "required": true },
    { "email": "alonso.almeida@bemobi.com", "required": false }
  ]
}
```
- `employees` é a **lista padrão** exibida na tela; o recrutador pode incluir/excluir e marcar obrigatório na UI (não precisa estar tudo aqui).
- `businessStartHour`/`businessEndHour`/`stepMin` regem a geração de horários.
- `publicBaseUrl` monta a URL dos links e o redirect de OAuth (pode ser sobrescrito por env).

### `tokens.json` (gerado em runtime, **sensível**)
```json
{ "natan.lucena@bemobi.com": { "refresh_token": "1//0g..." } }
```
Mapa e-mail → refresh token. É o que permite ao servidor emitir invites como cada organizador.

### `links.json` (gerado em runtime)
```json
{
  "mqwj9jfzs7nmh": {
    "organizer": "natan.lucena@bemobi.com",
    "included": ["natan.lucena@bemobi.com", "lucas.amaral@bemobi.com"],
    "required": ["natan.lucena@bemobi.com"],
    "urgent": false,
    "duration": 30,
    "slots": ["2026-06-29T13:30:00-03:00"],
    "title": "Reunião Bemobi",
    "createdAt": "2026-06-27T13:40:00.000Z"
  }
}
```

### Sessões (em memória, não persistido)
`Map<sid, email>` — recriado a cada login; perdido no restart.
