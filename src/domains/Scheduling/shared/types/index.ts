// ─────────────────────────────────────────────
// Contratos compartilhados do agendador (cliente + servidor).
// Implementados pela lib core (shared/lib/google + server/availability)
// e consumidos pelos route handlers, hooks e telas.
// ─────────────────────────────────────────────

// Um horário ofertado/disponível.
export type AvailabilitySlot = {
  start: string; // ISO com offset -03:00, ex.: "2026-06-29T13:30:00-03:00"
  label: string; // "HH:MM"
  urgentOnly: boolean; // só existe porque um opcional foi ignorado (urgência)
  conflicts: string[]; // e-mails de opcionais em conflito (quando urgentOnly)
};

export type DaySlots = {
  date: string; // "YYYY-MM-DD"
  slots: AvailabilitySlot[];
};

// Resposta de GET /api/scheduling/slots (recrutador).
export type SlotsResponse = {
  weekOffset: number;
  duration: number;
  days: DaySlots[];
};

// Resposta de GET /api/scheduling/config.
export type SchedulingConfigResponse = {
  eventTitle: string;
  defaultDurationMin: number;
  employees: { email: string; required: boolean }[];
};

// Resposta de POST /api/scheduling/links.
export type CreateLinkResponse = {
  id: string;
  url: string; // <base>/convite/<id>
  organizer: string;
};

// Slot na visão do candidato (inclui a data para agrupar por dia).
export type CandidateSlot = AvailabilitySlot & { date: string };

// Resposta de GET /api/scheduling/links/:id/slots (candidato).
export type LinkSlotsResponse = {
  title: string;
  duration: number;
  requested: number; // quantos foram ofertados originalmente
  available: number; // quantos seguem livres agora
  slots: CandidateSlot[];
  consumed?: boolean; // true quando o link já foi utilizado
};

// Resposta de POST /api/scheduling/links/:id/book (candidato).
export type BookResponse = {
  ok: true;
  htmlLink: string | null; // link "ver evento" no Google Calendar
  meetLink: string | null; // link da sala do Meet
  organizer: string;
};

// Resposta de GET /api/scheduling/candidate-invite?candidateId=... (board).
// Reflete o convite mais recente atrelado ao candidato (null se não houver).
export type CandidateInviteResponse = {
  hasInvite: boolean;
  status: string | null; // ACTIVE | CONSUMED
  inviteUrl: string | null; // <base>/convite/<id> (quando ainda ACTIVE)
  meetLink: string | null; // sala do Meet (após o candidato agendar)
  eventLink: string | null; // "ver evento" no Calendar
  slot: string | null; // horário ISO agendado
  candidateEmail: string | null; // e-mail informado pelo candidato
};

// ── Google ──

// Perfil resolvido após troca do code (exchangeCode).
export type GoogleProfile = {
  email: string;
  name: string | null;
  picture: string | null;
  googleId: string; // "sub" do OpenID
  refreshToken: string | null; // só vem com prompt=consent / 1º consentimento
  scope: string; // escopos concedidos (string separada por espaço)
};

// Tokens resolvidos a partir de um refresh token.
export type GoogleTokens = {
  accessToken: string;
  refreshToken: string | null;
  scope: string;
  expiresIn: number; // segundos
};

// Intervalo ocupado, em epoch ms.
export type BusyInterval = { start: number; end: number };
