"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/Button";
import { TextField } from "@/shared/ui/TextField";
import { Textarea } from "@/shared/ui/Textarea";
import {
  useCreateLink,
  useSchedulingConfig,
  useSlots,
  type SlotsArgs,
} from "../../hooks";
import styles from "./RecruiterScreen.module.css";

type Participant = {
  email: string;
  included: boolean;
  required: boolean;
};

function dayLabel(date: string): string {
  // date = "YYYY-MM-DD"; rótulo curto e estável (sem depender do fuso da máquina).
  const [, month, day] = date.split("-");
  return `${day}/${month}`;
}

export function RecruiterScreen({
  candidate,
  candidateId,
  position,
}: {
  candidate?: string;
  candidateId?: string;
  position?: string;
}) {
  const t = useTranslations("Scheduling.recruiter");

  const configQuery = useSchedulingConfig();
  const createLink = useCreateLink();

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [newEmail, setNewEmail] = useState("");

  const [duration, setDuration] = useState<number>(30);
  const [urgent, setUrgent] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);

  const [slotsArgs, setSlotsArgs] = useState<SlotsArgs | null>(null);
  const slotsQuery = useSlots(slotsArgs);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [linkUrl, setLinkUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Detalhes do evento (viram título/descrição do invite no Google).
  // Título padrão = "Entrevista (posição do candidato)" quando vier do board.
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Inicializa participantes + duração + título a partir do config (uma vez).
  if (configQuery.data && !initialized) {
    setParticipants(
      configQuery.data.employees.map((e) => ({
        email: e.email,
        included: true,
        required: e.required,
      })),
    );
    setDuration(configQuery.data.defaultDurationMin);
    setTitle(
      position ? `Entrevista (${position})` : configQuery.data.eventTitle,
    );
    setInitialized(true);
  }

  const included = useMemo(
    () => participants.filter((p) => p.included).map((p) => p.email),
    [participants],
  );
  const required = useMemo(
    () => participants.filter((p) => p.required).map((p) => p.email),
    [participants],
  );

  function toggleInclude(email: string) {
    setParticipants((prev) =>
      prev.map((p) => {
        if (p.email !== email) return p;
        const nextIncluded = !p.included;
        // Desmarcar Incluir remove Obrigatório.
        return {
          ...p,
          included: nextIncluded,
          required: nextIncluded ? p.required : false,
        };
      }),
    );
  }

  function toggleRequired(email: string) {
    setParticipants((prev) =>
      prev.map((p) => {
        if (p.email !== email) return p;
        const nextRequired = !p.required;
        // Marcar Obrigatório força Incluir.
        return {
          ...p,
          required: nextRequired,
          included: nextRequired ? true : p.included,
        };
      }),
    );
  }

  function addParticipant() {
    const email = newEmail.trim().toLowerCase();
    if (!email) return;
    if (participants.some((p) => p.email === email)) {
      setNewEmail("");
      return;
    }
    setParticipants((prev) => [
      ...prev,
      { email, included: true, required: false },
    ]);
    setNewEmail("");
  }

  function resetSelection() {
    setSelected(new Set());
    setLinkUrl(null);
    setCopied(false);
  }

  function onDurationChange(value: number) {
    setDuration(value);
    // Mudar a duração invalida a seleção (horários mudam).
    resetSelection();
  }

  function search() {
    resetSelection();
    setSlotsArgs({ weekOffset, duration, urgent, included, required });
  }

  function toggleSlot(start: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(start)) next.delete(start);
      else next.add(start);
      return next;
    });
    // Uma nova seleção invalida o link já gerado.
    setLinkUrl(null);
    setCopied(false);
  }

  async function generate() {
    if (selected.size === 0 || included.length === 0) return;
    const res = await createLink.mutateAsync({
      included,
      required,
      urgent,
      duration,
      slots: [...selected],
      title: title.trim() || configQuery.data?.eventTitle,
      description: description.trim() || undefined,
      candidateId,
    });
    setLinkUrl(res.url);
  }

  async function copyLink() {
    if (!linkUrl) return;
    await navigator.clipboard.writeText(linkUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const reloginNeeded =
    slotsQuery.isError &&
    (slotsQuery.error as { status?: number } | null)?.status === 403;

  const days = slotsQuery.data?.days ?? [];
  const generateDisabled = selected.size === 0 || included.length === 0;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t("title")}</h1>
        <p className={styles.subtitle}>{t("subtitle")}</p>
        {candidate ? (
          <p className={styles.forCandidate}>
            {t("forCandidate", { name: candidate })}
          </p>
        ) : null}
      </header>

      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>{t("eventDetails")}</h2>
        <TextField
          label={t("eventTitleLabel")}
          name="event-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("eventTitlePlaceholder")}
        />
        <Textarea
          label={t("descriptionLabel")}
          name="event-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("descriptionPlaceholder")}
          rows={3}
        />
      </section>

      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>{t("participants")}</h2>
        <div className={styles.participantList}>
          {participants.map((p) => (
            <div key={p.email} className={styles.participant}>
              <span className={styles.participantEmail}>{p.email}</span>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={p.included}
                  onChange={() => toggleInclude(p.email)}
                />
                {t("include")}
              </label>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={p.required}
                  onChange={() => toggleRequired(p.email)}
                />
                {t("required")}
              </label>
            </div>
          ))}
        </div>

        <div className={styles.addRow}>
          <div className={styles.addField}>
            <TextField
              label={t("addParticipant")}
              hideLabel
              type="email"
              placeholder={t("addParticipantPlaceholder")}
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addParticipant();
                }
              }}
            />
          </div>
          <Button variant="ghost" type="button" onClick={addParticipant}>
            {t("add")}
          </Button>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.toolbar}>
          <div className={styles.durationField}>
            <TextField
              label={t("duration")}
              type="number"
              min={5}
              max={480}
              step={5}
              value={duration}
              onChange={(e) =>
                onDurationChange(Number(e.target.value) || 0)
              }
            />
          </div>

          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={urgent}
              onChange={(e) => setUrgent(e.target.checked)}
            />
            {t("urgent")}
          </label>

          <div className={styles.weekNav}>
            <Button
              variant="ghost"
              type="button"
              aria-label={t("prevWeek")}
              disabled={weekOffset === 0}
              onClick={() => setWeekOffset((w) => Math.max(0, w - 1))}
            >
              ←
            </Button>
            <span className={styles.weekLabel}>
              {t("week", { n: weekOffset })}
            </span>
            <Button
              variant="ghost"
              type="button"
              aria-label={t("nextWeek")}
              onClick={() => setWeekOffset((w) => w + 1)}
            >
              →
            </Button>
          </div>

          <div className={styles.spacer} />

          <Button
            type="button"
            onClick={search}
            loading={slotsQuery.isFetching}
          >
            {slotsQuery.isFetching ? t("searching") : t("search")}
          </Button>
        </div>

        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <span className={`${styles.legendSwatch} ${styles.swatchFree}`} />
            {t("legendFree")}
          </span>
          <span className={styles.legendItem}>
            <span
              className={`${styles.legendSwatch} ${styles.swatchUrgent}`}
            />
            {t("legendUrgent")}
          </span>
          <span className={styles.legendItem}>
            <span
              className={`${styles.legendSwatch} ${styles.swatchSelected}`}
            />
            {t("legendSelected")}
          </span>
        </div>

        {reloginNeeded ? (
          <p className={styles.error}>{t("reloginNeeded")}</p>
        ) : slotsQuery.isError ? (
          <p className={styles.error}>{t("error")}</p>
        ) : slotsArgs && !slotsQuery.isFetching && days.length === 0 ? (
          <p className={styles.empty}>{t("noSlots")}</p>
        ) : days.length > 0 ? (
          <div className={styles.grid}>
            {days.map((day) => (
              <div key={day.date} className={styles.dayColumn}>
                <div className={styles.dayHeader}>{dayLabel(day.date)}</div>
                {day.slots.map((slot) => {
                  const isSelected = selected.has(slot.start);
                  const classes = [
                    styles.slot,
                    slot.urgentOnly && styles.slotUrgent,
                    isSelected && styles.slotSelected,
                  ]
                    .filter(Boolean)
                    .join(" ");
                  return (
                    <button
                      key={slot.start}
                      type="button"
                      className={classes}
                      aria-pressed={isSelected}
                      title={
                        slot.urgentOnly
                          ? slot.conflicts.join(", ")
                          : undefined
                      }
                      onClick={() => toggleSlot(slot.start)}
                    >
                      {isSelected ? "✓ " : ""}
                      {slot.label}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section className={styles.generateBar}>
        <span className={styles.selectedCount}>
          {t("selectedCount", { count: selected.size })}
        </span>

        {linkUrl ? (
          <>
            <div className={styles.linkRow}>
              <div className={styles.linkField}>
                <TextField
                  label={t("linkLabel")}
                  hideLabel
                  readOnly
                  value={linkUrl}
                  onFocus={(e) => e.target.select()}
                />
              </div>
              <Button variant="ghost" type="button" onClick={copyLink}>
                {copied ? t("copied") : t("copy")}
              </Button>
            </div>
            <Button variant="ghost" type="button" onClick={resetSelection}>
              {t("clear")}
            </Button>
          </>
        ) : (
          <>
            <div className={styles.spacer} />
            <Button
              type="button"
              disabled={generateDisabled}
              loading={createLink.isPending}
              onClick={generate}
            >
              {createLink.isPending ? t("generating") : t("generate")}
            </Button>
          </>
        )}
      </section>
    </div>
  );
}
