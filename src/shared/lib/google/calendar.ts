import "server-only";

import type { BusyInterval } from "@/domains/Scheduling/shared/types";

const CALENDAR_BASE = "https://www.googleapis.com/calendar/v3/calendars";

type EventDateTime = {
  date?: string; // all-day: "YYYY-MM-DD"
  dateTime?: string; // timed: ISO
};

type EventAttendee = {
  email?: string;
  responseStatus?: string;
};

type CalendarEvent = {
  status?: string;
  transparency?: string;
  attendees?: EventAttendee[];
  start?: EventDateTime;
  end?: EventDateTime;
};

type EventsListResponse = {
  items?: CalendarEvent[];
};

// Lê os eventos de um calendário e os converte em intervalos ocupados (epoch ms),
// aplicando as regras do protótipo (cancelados/free/declinados são ignorados).
// Best-effort: 403/404 (sem acesso à agenda) retornam []; 401 indica problema de
// escopo/relogin e propaga erro com "insufficient".
export async function fetchBusy(
  accessToken: string,
  calendarId: string,
  timeMinIso: string,
  timeMaxIso: string,
): Promise<BusyInterval[]> {
  const url =
    `${CALENDAR_BASE}/${encodeURIComponent(calendarId)}/events` +
    `?singleEvents=true&orderBy=startTime&maxResults=2500` +
    `&timeMin=${encodeURIComponent(timeMinIso)}` +
    `&timeMax=${encodeURIComponent(timeMaxIso)}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (res.status === 403 || res.status === 404) {
    return [];
  }
  if (res.status === 401) {
    throw new Error(
      "Acesso ao Calendar negado (401): token com escopo insufficient ou expirado — refaça o login.",
    );
  }
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Falha ao listar eventos (${res.status}): ${detail}`);
  }

  const data = (await res.json()) as EventsListResponse;
  const events = data.items ?? [];
  const busy: BusyInterval[] = [];
  const calLower = calendarId.toLowerCase();

  for (const event of events) {
    if (event.status === "cancelled") continue;
    if (event.transparency === "transparent") continue;

    // Pular eventos que esta pessoa recusou.
    const me = event.attendees?.find(
      (a) => (a.email ?? "").toLowerCase() === calLower,
    );
    if (me?.responseStatus === "declined") continue;

    const start = event.start;
    const end = event.end;
    if (!start || !end) continue;

    // Evento de dia inteiro: ocupa a janela [start.date, end.date).
    if (start.date && end.date) {
      const startMs = Date.parse(`${start.date}T00:00:00`);
      const endMs = Date.parse(`${end.date}T00:00:00`);
      if (!Number.isNaN(startMs) && !Number.isNaN(endMs)) {
        busy.push({ start: startMs, end: endMs });
      }
      continue;
    }

    if (start.dateTime && end.dateTime) {
      const startMs = Date.parse(start.dateTime);
      const endMs = Date.parse(end.dateTime);
      if (!Number.isNaN(startMs) && !Number.isNaN(endMs)) {
        busy.push({ start: startMs, end: endMs });
      }
    }
  }

  return busy;
}

type InsertEventParams = {
  title: string;
  description?: string;
  startIso: string;
  endIso: string;
  timeZone: string;
  attendees: string[];
  colorId?: string;
  // requestId único por evento — exigido pelo Google para criar a sala do Meet.
  meetRequestId: string;
};

type ConferenceEntryPoint = {
  entryPointType?: string;
  uri?: string;
};

type InsertEventResponse = {
  id?: string;
  htmlLink?: string;
  hangoutLink?: string;
  conferenceData?: {
    entryPoints?: ConferenceEntryPoint[];
  };
};

export type InsertedEvent = {
  id: string | null;
  htmlLink: string | null;
  meetLink: string | null;
};

// Cria o evento na agenda primária do organizador, gera a sala do Meet e envia
// os convites (sendUpdates=all). Para o Google criar/retornar a conferência é
// obrigatório conferenceDataVersion=1 + conferenceData.createRequest.
export async function insertEvent(
  accessToken: string,
  params: InsertEventParams,
): Promise<InsertedEvent> {
  const url = `${CALENDAR_BASE}/primary/events?sendUpdates=all&conferenceDataVersion=1`;

  const body = {
    summary: params.title,
    description: params.description,
    start: { dateTime: params.startIso, timeZone: params.timeZone },
    end: { dateTime: params.endIso, timeZone: params.timeZone },
    attendees: params.attendees.map((email) => ({ email })),
    colorId: params.colorId,
    conferenceData: {
      createRequest: {
        requestId: params.meetRequestId,
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Falha ao criar evento (${res.status}): ${detail}`);
  }

  const json = (await res.json()) as InsertEventResponse;

  // hangoutLink é o atalho direto; cai no entryPoint de vídeo se não vier.
  const meetLink =
    json.hangoutLink ??
    json.conferenceData?.entryPoints?.find(
      (e) => e.entryPointType === "video",
    )?.uri ??
    null;

  return {
    id: json.id ?? null,
    htmlLink: json.htmlLink ?? null,
    meetLink,
  };
}
