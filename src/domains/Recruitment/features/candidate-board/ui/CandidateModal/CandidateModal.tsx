"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/Button";
import { TextField } from "@/shared/ui/TextField";
import { Textarea } from "@/shared/ui/Textarea";
import { ScoreBadge } from "@/shared/ui/ScoreBadge";
import { Modal } from "@/shared/ui/Modal";
import { PencilIcon } from "@/shared/ui/icons";
import { EditCandidateModal } from "@/domains/Recruitment/features/job-candidates/ui/EditCandidateModal";
import { useAiGuard } from "@/shared/hooks/useAiGuard";
import { STAGE_ACCENT } from "../../constants/stages";
import {
  useCandidateInvite,
  useComputeScore,
  useSetScore,
  useEvaluateInterview,
  useProcessoAssessments,
} from "../../hooks";
import type { BoardCardDTO } from "../../types";
import { initials } from "../../utils";
import styles from "./CandidateModal.module.css";

type CandidateModalProps = {
  card: BoardCardDTO | null;
  onClose: () => void;
};

// ISO "YYYY-MM-DDTHH:MM:SS-03:00" → "DD/MM HH:MM" (lendo as strings, sem fuso).
function humanDateTime(iso: string): string {
  const [, month, day] = iso.slice(0, 10).split("-");
  return `${day}/${month} ${iso.slice(11, 16)}`;
}

export function CandidateModal({ card, onClose }: CandidateModalProps) {
  const t = useTranslations("Dashboard");
  const tStages = useTranslations("Dashboard.stages");
  const router = useRouter();
  const invite = useCandidateInvite(card?.id ?? null);

  const [editing, setEditing] = useState(false);
  const [nameOverride, setNameOverride] = useState<string | null>(null);
  const cardId = card?.id ?? null;
  // Reseta o estado local ao trocar de candidato.
  useEffect(() => {
    setEditing(false);
    setNameOverride(null);
  }, [cardId]);

  if (!card) return null;

  const displayName = nameOverride ?? card.candidateName;

  const accentStyle = {
    "--stage-accent": STAGE_ACCENT[card.stage],
  } as CSSProperties;

  function scheduleMeeting() {
    if (!card) return;
    const params = new URLSearchParams({
      candidate: nameOverride ?? card.candidateName,
      candidateId: card.id,
      position: card.position,
    });
    router.push(`/agendar?${params.toString()}`);
  }

  const data = invite.data;

  return (
    <Modal open onClose={onClose} title={t("candidateModalTitle")}>
      <div className={styles.content} style={accentStyle}>
        <div className={styles.identity}>
          <span className={styles.avatar} aria-hidden="true">
            {initials(displayName)}
          </span>
          <div className={styles.identityText}>
            <p className={styles.name}>{displayName}</p>
            <span className={styles.stage}>{tStages(card.stage)}</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={styles.editButton}
            onClick={() => setEditing(true)}
          >
            <PencilIcon />
            {t("editCandidate")}
          </Button>
        </div>

        <dl className={styles.info}>
          <div className={styles.row}>
            <dt className={styles.label}>{t("modalProject")}</dt>
            <dd className={styles.value}>{card.project}</dd>
          </div>
          <div className={styles.row}>
            <dt className={styles.label}>{t("modalPosition")}</dt>
            <dd className={styles.value}>{card.position}</dd>
          </div>
        </dl>

        <ScorePanel key={`score-${card.id}`} card={card} />

        <InterviewPanel key={`interview-${card.id}`} processoId={card.id} />

        <div className={styles.footer}>
          {invite.isLoading ? (
            <p className={styles.checking}>{t("checking")}</p>
          ) : data?.hasInvite ? (
            <div className={styles.scheduledBox}>
              <p className={styles.scheduled}>{t("alreadyScheduled")}</p>
              {data.slot ? (
                <p className={styles.scheduledMeta}>
                  {t("scheduledFor", { datetime: humanDateTime(data.slot) })}
                  {data.candidateEmail ? ` · ${data.candidateEmail}` : ""}
                </p>
              ) : null}
              {data.meetLink ? (
                <a
                  className={styles.meetLink}
                  href={data.meetLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("openMeet")}
                </a>
              ) : null}
            </div>
          ) : (
            <Button fullWidth onClick={scheduleMeeting}>
              {t("scheduleMeeting")}
            </Button>
          )}
        </div>
      </div>

      <EditCandidateModal
        candidatoId={card.candidatoId}
        open={editing}
        onClose={() => setEditing(false)}
        onSaved={(c) => setNameOverride(c.nome)}
      />
    </Modal>
  );
}

// Bloco de score de fit: exibição + edição manual + "Avaliar com IA".
// Montado com key={card.id} para reinicializar o estado a cada candidato.
function ScorePanel({ card }: { card: BoardCardDTO }) {
  const t = useTranslations("Dashboard");
  const compute = useComputeScore();
  const setScore = useSetScore();
  const aiGuard = useAiGuard();

  const [score, setLocalScore] = useState<number | null>(card.score);
  const [justificativa, setJustificativa] = useState<string | null>(
    card.justificativaFit,
  );
  const [manual, setManual] = useState(
    card.score != null ? String(card.score) : "",
  );

  const missingData =
    (compute.error as { status?: number } | null)?.status === 422;

  function handleCompute() {
    compute.mutate(card.id, {
      onSuccess: (result) => {
        setLocalScore(result.score);
        setJustificativa(result.justificativa);
        setManual(String(result.score));
      },
    });
  }

  function handleSaveManual() {
    const value = Number(manual);
    if (!Number.isInteger(value) || value < 0 || value > 100) return;
    setScore.mutate(
      { processoId: card.id, score: value },
      { onSuccess: (result) => setLocalScore(result.score) },
    );
  }

  return (
    <div className={styles.scoreSection}>
      <div className={styles.scoreHeader}>
        <span className={styles.label}>{t("scoreTitle")}</span>
        <ScoreBadge score={score} pendingLabel={t("scorePending")} />
      </div>

      <div className={styles.scoreControls}>
        <TextField
          label={t("scoreTitle")}
          hideLabel
          name="manualScore"
          type="number"
          min={0}
          max={100}
          value={manual}
          onChange={(event) => setManual(event.target.value)}
        />
        <Button
          type="button"
          variant="ghost"
          onClick={handleSaveManual}
          loading={setScore.isPending}
        >
          {t("scoreManualSave")}
        </Button>
        <Button
          type="button"
          onClick={() => aiGuard.ensure(handleCompute)}
          loading={compute.isPending}
        >
          {t("evaluateWithAi")}
        </Button>
      </div>

      {missingData ? (
        <p className={styles.scoreError} role="alert">
          {t("scoreMissingData")}
        </p>
      ) : compute.isError ? (
        <p className={styles.scoreError} role="alert">
          {t("scoreError")}
        </p>
      ) : null}

      {justificativa ? (
        <p className={styles.justificativaText}>{justificativa}</p>
      ) : null}

      {aiGuard.modal}
    </div>
  );
}

// Bloco "Avaliar entrevista": cola a transcrição → IA analisa e recomenda.
// Só informa (não move o card). Lista as avaliações já feitas para o processo.
function InterviewPanel({ processoId }: { processoId: string }) {
  const t = useTranslations("Dashboard");
  const [transcript, setTranscript] = useState("");
  const evaluate = useEvaluateInterview(processoId);
  const assessments = useProcessoAssessments(processoId);
  const aiGuard = useAiGuard();

  function handleEvaluate() {
    if (transcript.trim().length < 20) return;
    evaluate.mutate(transcript.trim(), {
      onSuccess: () => setTranscript(""),
    });
  }

  return (
    <div className={styles.scoreSection}>
      <Textarea
        label={t("interviewTitle")}
        name="transcript"
        placeholder={t("interviewPlaceholder")}
        value={transcript}
        onChange={(event) => setTranscript(event.target.value)}
        rows={4}
      />
      <Button
        type="button"
        onClick={() => aiGuard.ensure(handleEvaluate)}
        loading={evaluate.isPending}
        disabled={transcript.trim().length < 20}
      >
        {t("evaluateInterview")}
      </Button>

      {evaluate.isError ? (
        <p className={styles.scoreError} role="alert">
          {t("interviewError")}
        </p>
      ) : null}

      {(assessments.data ?? []).map((item) => (
        <div key={item.id} className={styles.assessmentItem}>
          <span
            className={[
              styles.assessmentDecision,
              item.decisao === "APROVAR"
                ? styles.decisionApprove
                : item.decisao === "REPROVAR"
                  ? styles.decisionReject
                  : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {item.decisao ? t(`decisao.${item.decisao}`) : "—"}
            {item.confianca != null ? ` · ${item.confianca}%` : ""}
          </span>
          {item.justificativa ? (
            <p className={styles.justificativaText}>{item.justificativa}</p>
          ) : null}
        </div>
      ))}

      {aiGuard.modal}
    </div>
  );
}
