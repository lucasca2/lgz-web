"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/Button";
import { Select } from "@/shared/ui/Select";
import { Textarea } from "@/shared/ui/Textarea";
import { usePositions } from "@/domains/Positions/features/position-list/hooks";
import {
  useAssessment,
  useAnalyze,
  useRecommend,
  useUpdateAssessment,
} from "../../hooks";
import { useAiGuard } from "@/shared/hooks/useAiGuard";
import { AnalysisPanel } from "../../ui/AnalysisPanel";
import { RecommendationPanel } from "../../ui/RecommendationPanel";
import { DecisionControls } from "../../ui/DecisionControls";
import { SummaryModal } from "../../ui/SummaryModal";
import { RejectionTemplateModal } from "../../ui/RejectionTemplateModal";
import { StatusBadge } from "../../ui/StatusBadge";
import { statusOf } from "../../utils/status";
import type { RequestError } from "../../utils/requestJson";
import styles from "./AssessmentDetailScreen.module.css";

type Tab = "recommendation" | "analysis" | "transcript";

function errorKey(error: unknown): string {
  return (error as RequestError | undefined)?.status === 503
    ? "errors.aiNotConfigured"
    : "errors.generic";
}

export function AssessmentDetailScreen({ id }: { id?: string }) {
  if (id) return <ExistingAssessment id={id} />;
  return <NewAssessment />;
}

// ── Modo "nova": posição + transcrição → Analisar ──
function NewAssessment() {
  const t = useTranslations("Assessments");
  const router = useRouter();
  const { data: positions } = usePositions();
  const analyze = useAnalyze();
  const aiGuard = useAiGuard();

  const [posicaoId, setPosicaoId] = useState("");
  const [transcricao, setTranscricao] = useState("");

  function handleAnalyze() {
    if (!transcricao.trim() || analyze.isPending) return;
    analyze.mutate(
      { transcricao: transcricao.trim(), posicaoId: posicaoId || null },
      { onSuccess: (data) => router.replace(`/avaliacoes/${data.id}`) },
    );
  }

  return (
    <div className={styles.page}>
      <BackLink label={t("detail.back")} />
      <header>
        <h1 className={styles.title}>{t("new.heading")}</h1>
        <p className={styles.subtitle}>{t("new.subtitle")}</p>
      </header>

      {analyze.isError ? (
        <p className={styles.banner} role="alert">
          {t(errorKey(analyze.error))}
        </p>
      ) : null}

      <div className={styles.formCard}>
        <Select
          label={t("position.label")}
          name="posicao"
          placeholder={t("position.placeholder")}
          value={posicaoId}
          onChange={setPosicaoId}
          options={(positions ?? []).map((item) => ({
            value: item.id,
            label: `${item.name} · ${t(`levels.${item.nivel}`)}`,
          }))}
        />
        <Textarea
          label={t("new.transcriptLabel")}
          name="transcricao"
          placeholder={t("new.transcriptPlaceholder")}
          value={transcricao}
          onChange={(event) => setTranscricao(event.target.value)}
          rows={16}
        />
        <div className={styles.formActions}>
          <span className={styles.charCount}>
            {t("charsCount", { count: transcricao.length })}
          </span>
          <Button
            type="button"
            size="md"
            onClick={() => aiGuard.ensure(handleAnalyze)}
            loading={analyze.isPending}
            disabled={!transcricao.trim()}
          >
            {t("new.analyze")}
          </Button>
        </div>
      </div>

      {aiGuard.modal}
    </div>
  );
}

// ── Modo existente: análise + recomendação + decisão ──
function ExistingAssessment({ id }: { id: string }) {
  const t = useTranslations("Assessments");
  const { data: assessment, isPending, isError } = useAssessment(id);
  const { data: positions } = usePositions();
  const recommend = useRecommend();
  const updatePosition = useUpdateAssessment();
  const aiGuard = useAiGuard();

  const [tab, setTab] = useState<Tab>("recommendation");
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [rejectionOpen, setRejectionOpen] = useState(false);

  if (isPending) return <p className={styles.state}>{t("loading")}</p>;
  if (isError || !assessment)
    return <p className={styles.stateError}>{t("notFound")}</p>;

  const hasRecommendation = Boolean(assessment.recommendation);
  const isRejected = assessment.decision === "REPROVAR";

  return (
    <div className={styles.page}>
      <BackLink label={t("detail.back")} />

      <header className={styles.detailHeader}>
        <div className={styles.detailHeading}>
          <h1 className={styles.title}>{assessment.candidateName}</h1>
          <p className={styles.subtitle}>{assessment.cargo ?? "—"}</p>
        </div>
        <div className={styles.detailHeaderSide}>
          <StatusBadge
            status={statusOf({
              decision: assessment.decision,
              hasAnalysis: Boolean(assessment.analysis),
            })}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => aiGuard.ensure(() => setSummaryOpen(true))}
          >
            {t("actions.summary")}
          </Button>
        </div>
      </header>

      <div className={styles.positionRow}>
        <Select
          label={t("position.label")}
          name="posicao"
          placeholder={t("position.placeholder")}
          value={assessment.posicaoId ?? ""}
          onChange={(value) => updatePosition.mutate({ id, posicaoId: value })}
          options={(positions ?? []).map((item) => ({
            value: item.id,
            label: `${item.name} · ${t(`levels.${item.nivel}`)}`,
          }))}
        />
      </div>

      <nav className={styles.tabs}>
        {(["recommendation", "analysis", "transcript"] as Tab[]).map((key) => (
          <button
            key={key}
            type="button"
            className={[styles.tab, tab === key && styles.tabActive]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setTab(key)}
          >
            {t(`tabs.${key}`)}
          </button>
        ))}
      </nav>

      {tab === "analysis" ? (
        assessment.analysis ? (
          <AnalysisPanel analysis={assessment.analysis} />
        ) : (
          <p className={styles.state}>{t("analysis.empty")}</p>
        )
      ) : null}

      {tab === "transcript" ? (
        <pre className={styles.transcript}>{assessment.transcricao}</pre>
      ) : null}

      {tab === "recommendation" ? (
        <div className={styles.recommendationTab}>
          {recommend.isError ? (
            <p className={styles.banner} role="alert">
              {t(errorKey(recommend.error))}
            </p>
          ) : null}

          {hasRecommendation && assessment.recommendation ? (
            <RecommendationPanel recommendation={assessment.recommendation} />
          ) : (
            <div className={styles.emptyRec}>
              <p className={styles.state}>{t("recommendation.empty")}</p>
              <Button
                type="button"
                size="md"
                loading={recommend.isPending}
                onClick={() => aiGuard.ensure(() => recommend.mutate(id))}
              >
                {t("recommendation.generate")}
              </Button>
            </div>
          )}

          <DecisionControls
            id={id}
            decision={assessment.decision}
            manualJustification={assessment.manualJustification}
          />

          {isRejected ? (
            <div className={styles.rejectionAction}>
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => aiGuard.ensure(() => setRejectionOpen(true))}
              >
                {t("actions.rejection")}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      <SummaryModal
        open={summaryOpen}
        onClose={() => setSummaryOpen(false)}
        assessment={assessment}
      />
      <RejectionTemplateModal
        open={rejectionOpen}
        onClose={() => setRejectionOpen(false)}
        id={id}
        candidateName={assessment.candidateName}
      />

      {aiGuard.modal}
    </div>
  );
}

function BackLink({ label }: { label: string }) {
  return (
    <Link href="/avaliacoes" className={styles.back}>
      ← {label}
    </Link>
  );
}
