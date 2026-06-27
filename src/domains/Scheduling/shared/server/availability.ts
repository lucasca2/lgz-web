import "server-only";

import { schedulingConfig } from "@/domains/Scheduling/shared/constants/config";
import type {
  AvailabilitySlot,
  BusyInterval,
  DaySlots,
} from "@/domains/Scheduling/shared/types";

const { businessStartHour, businessEndHour, stepMin, tzOffset } =
  schedulingConfig;

// ── Math de fuso fixo (America/Sao_Paulo, UTC-3 constante) ──
// Trabalhamos sempre em strings ISO com o offset fixo "-03:00", de modo que o
// resultado independe do fuso da máquina que roda o código.

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

// Componentes de uma data SP (ano/mês/dia) a partir de um epoch ms.
type SpDate = { year: number; month: number; day: number };

const SP_OFFSET_MS = 3 * 60 * 60 * 1000; // UTC-3 → soma-se ao tempo local p/ virar UTC

// Retorna ano/mês/dia/diaDaSemana SP para um epoch ms.
function spParts(ms: number): SpDate & { weekday: number } {
  // Deslocar para "horário de parede" SP e ler em UTC.
  const d = new Date(ms - SP_OFFSET_MS);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    weekday: d.getUTCDay(), // 0=Dom ... 1=Seg ... 6=Sáb
  };
}

// Monta um ISO com o offset fixo a partir de componentes SP de parede.
function spIso(
  date: SpDate,
  hour: number,
  minute: number,
  second: number,
): string {
  return (
    `${date.year}-${pad2(date.month)}-${pad2(date.day)}` +
    `T${pad2(hour)}:${pad2(minute)}:${pad2(second)}${tzOffset}`
  );
}

function spDateStr(date: SpDate): string {
  return `${date.year}-${pad2(date.month)}-${pad2(date.day)}`;
}

// Adiciona `days` a uma data SP, retornando a nova data SP.
function addDays(date: SpDate, days: number): SpDate {
  // Meio-dia SP evita qualquer ambiguidade de borda de dia.
  const baseMs = Date.parse(spIso(date, 12, 0, 0));
  const p = spParts(baseMs + days * 24 * 60 * 60 * 1000);
  return { year: p.year, month: p.month, day: p.day };
}

// ── Helpers exportados ──

// Ordena por início e funde intervalos sobrepostos/adjacentes.
export function mergeBusy(intervals: BusyInterval[]): BusyInterval[] {
  if (intervals.length === 0) return [];
  const sorted = [...intervals].sort((a, b) => a.start - b.start);
  const merged: BusyInterval[] = [{ ...sorted[0] }];
  for (let i = 1; i < sorted.length; i++) {
    const cur = sorted[i];
    const last = merged[merged.length - 1];
    if (cur.start <= last.end) {
      last.end = Math.max(last.end, cur.end);
    } else {
      merged.push({ ...cur });
    }
  }
  return merged;
}

// true se [startMs, endMs) sobrepõe algum intervalo de `merged`.
export function anyBusy(
  merged: BusyInterval[],
  startMs: number,
  endMs: number,
): boolean {
  for (const iv of merged) {
    if (startMs < iv.end && endMs > iv.start) return true;
  }
  return false;
}

// Janela Seg→Sex da semana-alvo. Base = PRÓXIMA semana útil (Segunda desta
// semana + 7 dias); weekOffset (≥0) adiciona weekOffset*7 dias.
export function weekRangeIso(weekOffset: number): {
  timeMinIso: string;
  timeMaxIso: string;
} {
  const todayParts = spParts(Date.now());
  const today: SpDate = {
    year: todayParts.year,
    month: todayParts.month,
    day: todayParts.day,
  };

  // Segunda desta semana: weekday 1. Domingo(0) conta como -6.
  const wd = todayParts.weekday;
  const daysFromMonday = wd === 0 ? 6 : wd - 1;
  const mondayThisWeek = addDays(today, -daysFromMonday);

  const monday = addDays(mondayThisWeek, 7 + weekOffset * 7);
  const friday = addDays(monday, 4);

  return {
    timeMinIso: spIso(monday, 0, 0, 0),
    timeMaxIso: spIso(friday, 23, 59, 59),
  };
}

// Calcula o ISO de fim somando durationMin ao início (mesmo offset fixo).
export function slotEndIso(startIso: string, durationMin: number): string {
  const endMs = Date.parse(startIso) + durationMin * 60 * 1000;
  const p = spParts(endMs);
  const d = new Date(endMs - SP_OFFSET_MS);
  return spIso(
    { year: p.year, month: p.month, day: p.day },
    d.getUTCHours(),
    d.getUTCMinutes(),
    d.getUTCSeconds(),
  );
}

type ComputeOpts = {
  weekOffset: number;
  durationMin: number;
  included: string[];
  required: string[];
  urgent: boolean;
  busyByEmail: Map<string, BusyInterval[]>;
};

// Gera Seg–Sex da semana-alvo com os horários ofertados.
export function computeDays(opts: ComputeOpts): DaySlots[] {
  const { weekOffset, durationMin, included, required, urgent, busyByEmail } =
    opts;

  const { timeMinIso } = weekRangeIso(weekOffset);
  const mondayParts = spParts(Date.parse(timeMinIso));
  const monday: SpDate = {
    year: mondayParts.year,
    month: mondayParts.month,
    day: mondayParts.day,
  };

  // Conjunto de restrição e opcionais.
  const requiredSet = new Set(required);
  const constraintSet = urgent ? required : included;
  const optionalEmails = urgent
    ? included.filter((e) => !requiredSet.has(e))
    : [];

  const days: DaySlots[] = [];

  for (let dayIdx = 0; dayIdx < 5; dayIdx++) {
    const date = addDays(monday, dayIdx);
    const dateStr = spDateStr(date);
    const slots: AvailabilitySlot[] = [];

    // Horários de início: de businessStartHour até businessEndHour, passo stepMin,
    // exigindo start+duration ≤ businessEndHour.
    const startMinutes = businessStartHour * 60;
    const endMinutes = businessEndHour * 60;

    for (
      let mins = startMinutes;
      mins + durationMin <= endMinutes;
      mins += stepMin
    ) {
      const hour = Math.floor(mins / 60);
      const minute = mins % 60;
      const startIso = spIso(date, hour, minute, 0);
      const startMs = Date.parse(startIso);
      const endMs = startMs + durationMin * 60 * 1000;

      // O slot é ofertado se está livre para todos do conjunto de restrição.
      const free = constraintSet.every((email) => {
        const busy = busyByEmail.get(email) ?? [];
        return !anyBusy(busy, startMs, endMs);
      });
      if (!free) continue;

      // Conflitos: em modo urgente, opcionais ocupados neste horário.
      let conflicts: string[] = [];
      if (urgent) {
        conflicts = optionalEmails.filter((email) => {
          const busy = busyByEmail.get(email) ?? [];
          return anyBusy(busy, startMs, endMs);
        });
      }
      const urgentOnly = urgent && conflicts.length > 0;

      slots.push({
        start: startIso,
        label: `${pad2(hour)}:${pad2(minute)}`,
        urgentOnly,
        conflicts,
      });
    }

    // Omite dias sem horários (mesmo comportamento do protótipo).
    if (slots.length > 0) {
      days.push({ date: dateStr, slots });
    }
  }

  return days;
}
