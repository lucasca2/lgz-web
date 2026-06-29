"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/Button";
import { TextField } from "@/shared/ui/TextField";
import { Modal } from "@/shared/ui/Modal";
import { CalendarIcon, CheckIcon } from "@/shared/ui/icons";
import type { CandidateSlot } from "@/domains/Scheduling/shared/types";
import { useBookSlot, useLinkSlots } from "../../hooks";
import styles from "./CandidateScreen.module.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// "YYYY-MM-DD" → "DD/MM" (sem dependência de locale/timezone).
function dayLabel(date: string): string {
  const [, month, day] = date.split("-");
  return `${day}/${month}`;
}

// ISO com offset (-03:00) → "DD/MM HH:MM" lendo direto das strings.
function humanDateTime(start: string): string {
  return `${dayLabel(start.slice(0, 10))} ${start.slice(11, 16)}`;
}

type DayGroup = { date: string; slots: CandidateSlot[] };

function groupByDay(slots: CandidateSlot[]): DayGroup[] {
  const map = new Map<string, CandidateSlot[]>();
  for (const slot of slots) {
    const list = map.get(slot.date);
    if (list) list.push(slot);
    else map.set(slot.date, [slot]);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, daySlots]) => ({ date, slots: daySlots }));
}

export function CandidateScreen({ id }: { id: string }) {
  const t = useTranslations("Scheduling.candidate");
  const { data, isLoading, isError, error } = useLinkSlots(id);
  const book = useBookSlot(id);

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [pending, setPending] = useState<CandidateSlot | null>(null);
  const [bookError, setBookError] = useState<string | null>(null);

  const days = useMemo(
    () => (data ? groupByDay(data.slots) : []),
    [data],
  );

  if (isLoading) {
    return (
      <div className={styles.shell}>
        <div className={styles.card}>
          <p className={styles.muted}>…</p>
        </div>
      </div>
    );
  }

  const status = (error as { status?: number } | null)?.status;
  if (isError && status === 404) {
    return (
      <div className={styles.shell}>
        <div className={styles.card}>
          <div className={styles.state}>
            <span className={`${styles.stateIcon} ${styles.stateIconNeutral}`}>
              <CalendarIcon className={styles.stateIconSvg} />
            </span>
            <h1 className={styles.stateTitle}>{t("notFound")}</h1>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className={styles.shell}>
        <div className={styles.card}>
          <p className={styles.error} role="alert">
            {t("error")}
          </p>
        </div>
      </div>
    );
  }

  if (data.consumed) {
    return (
      <div className={styles.shell}>
        <div className={styles.card}>
          <div className={styles.state}>
            <span className={`${styles.stateIcon} ${styles.stateIconNeutral}`}>
              <CalendarIcon className={styles.stateIconSvg} />
            </span>
            <h1 className={styles.stateTitle}>{t("consumed")}</h1>
            <p className={styles.stateHint}>{t("consumedHint")}</p>
          </div>
        </div>
      </div>
    );
  }

  // Estado de sucesso.
  if (book.isSuccess) {
    return (
      <div className={styles.shell}>
        <div className={styles.card}>
          <div className={styles.state}>
            <span className={`${styles.stateIcon} ${styles.stateIconSuccess}`}>
              <CheckIcon className={styles.stateIconSvg} />
            </span>
            <h1 className={styles.stateTitle}>{t("booked")}</h1>
            {book.data.htmlLink ? (
              <a
                className={styles.eventLink}
                href={book.data.htmlLink}
                target="_blank"
                rel="noreferrer"
              >
                {t("viewEvent")}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  const removed = data.requested - data.available;

  function onPick(slot: CandidateSlot) {
    if (!EMAIL_RE.test(email.trim())) {
      setEmailError(t("emailRequired"));
      return;
    }
    setEmailError(null);
    setBookError(null);
    setPending(slot);
  }

  async function onConfirm() {
    if (!pending) return;
    const start = pending.start;
    try {
      await book.mutateAsync({ start, email: email.trim() });
      setPending(null);
    } catch (err) {
      const code = (err as { status?: number }).status;
      setPending(null);
      if (code === 410) setBookError(t("consumed"));
      else setBookError(t("error")); // 409 também: slots já são revalidados via invalidate
    }
  }

  return (
    <div className={styles.shell}>
      <div className={styles.card}>
        <header className={styles.header}>
          <h1 className={styles.title}>{t("title")}</h1>
          <p className={styles.subtitle}>
            {t("subtitle", { title: data.title, duration: data.duration })}
          </p>
          <span className={styles.count}>
            {t("availableCount", { available: data.available })}
          </span>
          {removed > 0 ? (
            <p className={styles.removed}>
              {t("removedNote", { count: removed })}
            </p>
          ) : null}
        </header>

        <div className={styles.emailRow}>
          <TextField
            type="email"
            name="candidate-email"
            label={t("emailLabel")}
            placeholder={t("emailPlaceholder")}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError(null);
            }}
            error={emailError ?? undefined}
            autoComplete="email"
          />
        </div>

        {bookError ? (
          <p className={styles.error} role="alert">
            {bookError}
          </p>
        ) : null}

        {days.length === 0 ? (
          <p className={styles.muted}>{t("noSlots")}</p>
        ) : (
          <div className={styles.slots}>
            {days.map((day) => (
              <section key={day.date} className={styles.day}>
                <h2 className={styles.dayLabel}>{dayLabel(day.date)}</h2>
                <div className={styles.chips}>
                  {day.slots.map((slot) => (
                    <button
                      key={slot.start}
                      type="button"
                      className={styles.chip}
                      onClick={() => onPick(slot)}
                      title={slot.urgentOnly ? t("pick") : undefined}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={pending !== null}
        onClose={() => {
          if (!book.isPending) setPending(null);
        }}
        title={t("confirmTitle")}
      >
        <div className={styles.dialogContent}>
          <p className={styles.dialogBody}>
            {pending
              ? t("confirmBody", {
                  datetime: humanDateTime(pending.start),
                  email: email.trim(),
                })
              : ""}
          </p>
          <div className={styles.dialogActions}>
            <Button
              variant="ghost"
              onClick={() => setPending(null)}
              disabled={book.isPending}
            >
              {t("cancel")}
            </Button>
            <Button onClick={onConfirm} loading={book.isPending}>
              {book.isPending ? t("booking") : t("confirm")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
