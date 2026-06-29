"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/Button";
import { TextField } from "@/shared/ui/TextField";
import { Textarea } from "@/shared/ui/Textarea";
import { CalendarIcon, CheckIcon, PlusIcon } from "@/shared/ui/icons";
import { useCurrentUser } from "@/domains/Auth/shared/hooks";
import {
  useCreateLink,
  useRecommendations,
  useSchedulingConfig,
  useSlots,
  type SlotsArgs,
} from "../../hooks";
import { Avatar } from "../../ui/Avatar";
import {
  ParticipantsModal,
  type AddedPerson,
} from "../../ui/ParticipantsModal";
import styles from "./RecruiterScreen.module.css";

type Participant = {
  email: string;
  included: boolean;
  required: boolean;
  name?: string;
  picture?: string | null;
};

const DURATION_PRESETS = [15, 30, 45, 60];

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
  const currentUserQuery = useCurrentUser();
  const recommendationsQuery = useRecommendations(position);
  const createLink = useCreateLink();

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const [duration, setDuration] = useState<number>(30);
  const [customDuration, setCustomDuration] = useState(false);
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

  // Inicializa duração + título + participante default (uma vez). O participante
  // default é o próprio usuário logado, marcado como Opcional (ele organiza a
  // reunião). Espera o /me resolver para não semear a lista vazia numa corrida.
  if (configQuery.data && !currentUserQuery.isLoading && !initialized) {
    const me = currentUserQuery.data;
    setParticipants(
      me
        ? [
            {
              email: me.email,
              included: true,
              required: false,
              name: me.name ?? undefined,
              picture: me.picture,
            },
          ]
        : [],
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

  function addPerson(person: AddedPerson) {
    const email = person.email.trim().toLowerCase();
    if (!email) return;
    if (participants.some((p) => p.email === email)) return;
    setParticipants((prev) => [
      ...prev,
      {
        email,
        included: true,
        required: person.required ?? false,
        name: person.name,
        picture: person.picture,
      },
    ]);
  }

  function removeParticipant(email: string) {
    setParticipants((prev) => prev.filter((p) => p.email !== email));
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

  function selectPreset(value: number) {
    setCustomDuration(false);
    onDurationChange(value);
  }

  function search() {
    resetSelection();
    setSlotsArgs({ weekOffset, duration, urgent, included, required });
  }

  // Setas da agenda paginam a semana; se já houve uma busca, recarrega na hora.
  function goToWeek(offset: number) {
    const next = Math.max(0, offset);
    setWeekOffset(next);
    if (slotsArgs) {
      resetSelection();
      setSlotsArgs({ weekOffset: next, duration, urgent, included, required });
    }
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
      position,
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
  const usingCustom = customDuration || !DURATION_PRESETS.includes(duration);

  // Recomendados que ainda não estão na lista (aprendidos do histórico da posição).
  const recommended = (recommendationsQuery.data ?? []).filter(
    (r) => !participants.some((p) => p.email === r.email),
  );

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

      <section className={styles.eventCard}>
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
          rows={2}
        />
      </section>

      <div className={styles.columns}>
        <section className={styles.configCol}>
          <div className={styles.block}>
            <h2 className={styles.panelTitle}>{t("participants")}</h2>
            <div className={styles.participantList}>
              {participants.length === 0 ? (
                <p className={styles.participantsEmpty}>
                  {t("participantsEmpty")}
                </p>
              ) : (
                participants.map((p) => (
                  <div
                    key={p.email}
                    className={styles.participant}
                    data-included={p.included || undefined}
                  >
                    <Avatar email={p.email} name={p.name} picture={p.picture} />
                    <div className={styles.participantInfo}>
                      <span className={styles.participantName}>
                        {p.name ?? p.email}
                      </span>
                      {p.name ? (
                        <span className={styles.participantEmail}>
                          {p.email}
                        </span>
                      ) : null}
                    </div>
                    {p.included ? (
                      <button
                        type="button"
                        className={styles.reqToggle}
                        data-on={p.required || undefined}
                        aria-pressed={p.required}
                        onClick={() => toggleRequired(p.email)}
                      >
                        {p.required ? t("requiredFull") : t("optional")}
                      </button>
                    ) : null}
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        className={styles.switchInput}
                        checked={p.included}
                        onChange={() => toggleInclude(p.email)}
                        aria-label={t("include")}
                      />
                      <span className={styles.switchTrack}>
                        <span className={styles.switchThumb} />
                      </span>
                    </label>
                    <button
                      type="button"
                      className={styles.removeBtn}
                      aria-label={t("removeParticipant")}
                      onClick={() => removeParticipant(p.email)}
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>

            {recommended.length > 0 ? (
              <div className={styles.recommend}>
                <span className={styles.recommendLabel}>
                  {t("recommended")}
                </span>
                <div className={styles.recommendChips}>
                  {recommended.map((r) => (
                    <button
                      key={r.email}
                      type="button"
                      className={styles.recommendChip}
                      title={r.email}
                      onClick={() =>
                        addPerson({ email: r.email, required: r.required })
                      }
                    >
                      <PlusIcon className={styles.recommendChipIcon} />
                      {r.email.split("@")[0]}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <Button
              variant="ghost"
              type="button"
              fullWidth
              onClick={() => setModalOpen(true)}
            >
              <PlusIcon className={styles.addIcon} />
              {t("addPeople")}
            </Button>
          </div>

          <div className={styles.block}>
            <h2 className={styles.panelTitle}>{t("parameters")}</h2>

            <div className={styles.field}>
              <span className={styles.fieldLabel}>{t("duration")}</span>
              <div
                className={styles.segmented}
                role="group"
                aria-label={t("duration")}
              >
                {DURATION_PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={styles.segment}
                    data-active={(!usingCustom && duration === p) || undefined}
                    aria-pressed={!usingCustom && duration === p}
                    onClick={() => selectPreset(p)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  type="button"
                  className={styles.segment}
                  data-active={usingCustom || undefined}
                  aria-pressed={usingCustom}
                  onClick={() => setCustomDuration(true)}
                >
                  {t("durationOther")}
                </button>
              </div>
              {usingCustom ? (
                <div className={styles.customDuration}>
                  <TextField
                    label={t("duration")}
                    hideLabel
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
              ) : null}
            </div>

            <label className={styles.switchField}>
              <span className={styles.switch}>
                <input
                  type="checkbox"
                  className={styles.switchInput}
                  checked={urgent}
                  onChange={(e) => setUrgent(e.target.checked)}
                />
                <span className={styles.switchTrack}>
                  <span className={styles.switchThumb} />
                </span>
              </span>
              <span className={styles.switchText}>
                <span className={styles.switchLabel}>{t("urgentLabel")}</span>
                <span className={styles.switchHelper}>{t("urgentHelper")}</span>
              </span>
            </label>

            <Button
              type="button"
              fullWidth
              onClick={search}
              loading={slotsQuery.isFetching}
            >
              {slotsQuery.isFetching ? t("searching") : t("search")}
            </Button>
          </div>
        </section>

        <section className={styles.agendaCol}>
          <div className={styles.agendaHeader}>
            <h2 className={styles.panelTitle}>{t("agenda")}</h2>
            {days.length > 0 ? (
              <div className={styles.legend}>
                <span className={styles.legendItem}>
                  <span
                    className={`${styles.legendSwatch} ${styles.swatchFree}`}
                  />
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
            ) : null}
          </div>

          <div className={styles.weekSlider}>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              className={styles.weekArrow}
              aria-label={t("prevWeek")}
              disabled={weekOffset === 0}
              onClick={() => goToWeek(weekOffset - 1)}
            >
              ←
            </Button>

            <div className={styles.weekContent}>
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
                      <div className={styles.dayHeader}>
                        {dayLabel(day.date)}
                      </div>
                      <div className={styles.daySlots}>
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
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.placeholder}>
                  <CalendarIcon className={styles.placeholderIcon} />
                  <p>{t("agendaEmpty")}</p>
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              type="button"
              className={styles.weekArrow}
              aria-label={t("nextWeek")}
              onClick={() => goToWeek(weekOffset + 1)}
            >
              →
            </Button>
          </div>
        </section>
      </div>

      {linkUrl ? (
        <section className={styles.successBar}>
          <span className={styles.successCheck} aria-hidden="true">
            <CheckIcon className={styles.successCheckIcon} />
          </span>
          <div className={styles.successBody}>
            <span className={styles.successLabel}>{t("linkGenerated")}</span>
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
          </div>
          <Button variant="ghost" type="button" onClick={resetSelection}>
            {t("clear")}
          </Button>
        </section>
      ) : (
        <section className={styles.actionBar}>
          <span className={styles.selectedCount}>
            {t("selectedCount", { count: selected.size })}
          </span>
          <div className={styles.spacer} />
          <Button
            type="button"
            disabled={generateDisabled}
            loading={createLink.isPending}
            onClick={generate}
          >
            {createLink.isPending ? t("generating") : t("generate")}
          </Button>
        </section>
      )}

      <ParticipantsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        existingEmails={participants.map((p) => p.email)}
        onAdd={addPerson}
      />
    </div>
  );
}
