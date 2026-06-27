"use client";

import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/Button";
import { Modal } from "@/shared/ui/Modal";
import { STAGE_ACCENT } from "../../constants/stages";
import { useCandidateInvite } from "../../hooks";
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

  if (!card) return null;

  const accentStyle = {
    "--stage-accent": STAGE_ACCENT[card.stage],
  } as CSSProperties;

  function scheduleMeeting() {
    if (!card) return;
    const params = new URLSearchParams({
      candidate: card.candidateName,
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
            {initials(card.candidateName)}
          </span>
          <div className={styles.identityText}>
            <p className={styles.name}>{card.candidateName}</p>
            <span className={styles.stage}>{tStages(card.stage)}</span>
          </div>
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
    </Modal>
  );
}
