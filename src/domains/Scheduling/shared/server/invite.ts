import "server-only";

import { schedulingConfig } from "@/domains/Scheduling/shared/constants/config";
import {
  anyBusy,
  computeDays,
  mergeBusy,
  slotEndIso,
  weekRangeIso,
} from "@/domains/Scheduling/shared/server/availability";
import type {
  BusyInterval,
  CandidateSlot,
  SlotsResponse,
} from "@/domains/Scheduling/shared/types";
import {
  fetchBusy,
  insertEvent,
  type InsertedEvent,
} from "@/shared/lib/google/calendar";
import { refreshAccessToken } from "@/shared/lib/google/oauth";

// Resolve um access_token a partir do refresh_token do organizador.
export async function getOrganizerAccessToken(
  refreshToken: string,
): Promise<string> {
  if (!refreshToken) {
    throw new Error("refreshToken ausente para o organizador.");
  }
  const tokens = await refreshAccessToken(refreshToken);
  if (!tokens.accessToken) {
    throw new Error("Não foi possível resolver o access_token do organizador.");
  }
  return tokens.accessToken;
}

// Busca a agenda de cada e-mail (concorrente, best-effort) e funde os intervalos.
export async function loadBusyByEmail(
  accessToken: string,
  emails: string[],
  timeMinIso: string,
  timeMaxIso: string,
): Promise<Map<string, BusyInterval[]>> {
  const unique = [...new Set(emails)];
  const results = await Promise.all(
    unique.map(async (email) => {
      const busy = await fetchBusy(accessToken, email, timeMinIso, timeMaxIso);
      return [email, mergeBusy(busy)] as const;
    }),
  );
  return new Map(results);
}

type BuildSlotsOpts = {
  refreshToken: string;
  weekOffset: number;
  durationMin: number;
  included: string[];
  required: string[];
  urgent: boolean;
};

// Monta a grade de horários ofertados para o recrutador.
export async function buildSlotsForRecruiter(
  opts: BuildSlotsOpts,
): Promise<SlotsResponse> {
  const accessToken = await getOrganizerAccessToken(opts.refreshToken);
  const { timeMinIso, timeMaxIso } = weekRangeIso(opts.weekOffset);

  // Carrega a agenda de TODOS os incluídos (superset) para anotar conflitos.
  const busyByEmail = await loadBusyByEmail(
    accessToken,
    opts.included,
    timeMinIso,
    timeMaxIso,
  );

  const days = computeDays({
    weekOffset: opts.weekOffset,
    durationMin: opts.durationMin,
    included: opts.included,
    required: opts.required,
    urgent: opts.urgent,
    busyByEmail,
  });

  return { weekOffset: opts.weekOffset, duration: opts.durationMin, days };
}

// Lógica compartilhada de anotação de urgência/conflito para um único slot.
function annotateSlot(
  startMs: number,
  endMs: number,
  urgent: boolean,
  optionalEmails: string[],
  busyByEmail: Map<string, BusyInterval[]>,
): { urgentOnly: boolean; conflicts: string[] } {
  if (!urgent) return { urgentOnly: false, conflicts: [] };
  const conflicts = optionalEmails.filter((email) =>
    anyBusy(busyByEmail.get(email) ?? [], startMs, endMs),
  );
  return { urgentOnly: conflicts.length > 0, conflicts };
}

// Componentes SP (data/label) a partir de um ISO com offset fixo.
function spLabelDate(startIso: string): { label: string; date: string } {
  // startIso = "YYYY-MM-DDTHH:MM:SS-03:00" — parse direto das strings.
  const date = startIso.slice(0, 10);
  const label = startIso.slice(11, 16);
  return { label, date };
}

type RevalidateOpts = {
  refreshToken: string;
  durationMin: number;
  offeredIso: string[];
  included: string[];
  required: string[];
  urgent: boolean;
};

// Revalida uma lista de horários ofertados, retornando só os que seguem livres.
export async function revalidateOfferedSlots(
  opts: RevalidateOpts,
): Promise<CandidateSlot[]> {
  const { durationMin, offeredIso, included, required, urgent } = opts;
  if (offeredIso.length === 0) return [];

  const accessToken = await getOrganizerAccessToken(opts.refreshToken);

  const requiredSet = new Set(required);
  const optionalEmails = urgent
    ? included.filter((e) => !requiredSet.has(e))
    : [];
  const constraintSet = urgent ? required : included;

  const startMsList = offeredIso.map((iso) => Date.parse(iso));
  const minStartMs = Math.min(...startMsList);
  const maxStartMs = Math.max(...startMsList);
  const timeMinIso = new Date(minStartMs).toISOString();
  const timeMaxIso = new Date(
    maxStartMs + durationMin * 60 * 1000,
  ).toISOString();

  const busyByEmail = await loadBusyByEmail(
    accessToken,
    included,
    timeMinIso,
    timeMaxIso,
  );

  const now = Date.now();
  const sorted = [...offeredIso].sort(
    (a, b) => Date.parse(a) - Date.parse(b),
  );

  const out: CandidateSlot[] = [];
  for (const startIso of sorted) {
    const startMs = Date.parse(startIso);
    if (startMs <= now) continue; // já passou
    const endMs = startMs + durationMin * 60 * 1000;

    const free = constraintSet.every(
      (email) => !anyBusy(busyByEmail.get(email) ?? [], startMs, endMs),
    );
    if (!free) continue;

    const { urgentOnly, conflicts } = annotateSlot(
      startMs,
      endMs,
      urgent,
      optionalEmails,
      busyByEmail,
    );
    const { label, date } = spLabelDate(startIso);
    out.push({ start: startIso, label, date, urgentOnly, conflicts });
  }

  return out;
}

type SingleCheckOpts = {
  refreshToken: string;
  durationMin: number;
  startIso: string;
  included: string[];
  required: string[];
  urgent: boolean;
};

// Re-checa um único horário no momento do booking.
export async function isSlotStillFree(
  opts: SingleCheckOpts,
): Promise<{ free: boolean; urgentOnly: boolean; conflicts: string[] }> {
  const { durationMin, startIso, included, required, urgent } = opts;

  const accessToken = await getOrganizerAccessToken(opts.refreshToken);

  const requiredSet = new Set(required);
  const optionalEmails = urgent
    ? included.filter((e) => !requiredSet.has(e))
    : [];
  const constraintSet = urgent ? required : included;

  const startMs = Date.parse(startIso);
  const endMs = startMs + durationMin * 60 * 1000;
  const timeMinIso = new Date(startMs).toISOString();
  const timeMaxIso = new Date(endMs).toISOString();

  const busyByEmail = await loadBusyByEmail(
    accessToken,
    included,
    timeMinIso,
    timeMaxIso,
  );

  const free = constraintSet.every(
    (email) => !anyBusy(busyByEmail.get(email) ?? [], startMs, endMs),
  );

  const { urgentOnly, conflicts } = annotateSlot(
    startMs,
    endMs,
    urgent,
    optionalEmails,
    busyByEmail,
  );

  return { free, urgentOnly, conflicts };
}

type EmitInviteOpts = {
  refreshToken: string;
  title: string;
  startIso: string;
  durationMin: number;
  attendees: string[];
  urgent: boolean;
  conflicts: string[];
};

// Cria o evento no Calendar do organizador (com sala do Meet e marcação de
// urgência se aplicável). Retorna id do evento, link do Calendar e link do Meet.
export async function emitInvite(opts: EmitInviteOpts): Promise<InsertedEvent> {
  const accessToken = await getOrganizerAccessToken(opts.refreshToken);
  const endIso = slotEndIso(opts.startIso, opts.durationMin);

  let title = opts.title;
  let description: string | undefined;
  let colorId: string | undefined;

  if (opts.urgent && opts.conflicts.length > 0) {
    title = `🔴 [URGENTE] ${opts.title}`;
    colorId = "11";
    description =
      "Agendado em modo urgente. Opcionais ignorados (em conflito): " +
      opts.conflicts.join(", ");
  }

  // requestId único por evento (atrela à sala criada). Determinístico pelo slot
  // + entropia curta para evitar colisão em reuso do mesmo horário.
  const meetRequestId = `meet-${Date.parse(opts.startIso)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

  return insertEvent(accessToken, {
    title,
    description,
    startIso: opts.startIso,
    endIso,
    timeZone: schedulingConfig.timeZone,
    attendees: opts.attendees,
    colorId,
    meetRequestId,
  });
}
