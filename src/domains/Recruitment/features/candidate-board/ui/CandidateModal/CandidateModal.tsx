"use client";

import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/Button";
import { Modal } from "@/shared/ui/Modal";
import { STAGE_ACCENT } from "../../constants/stages";
import type { BoardCardDTO } from "../../types";
import { initials } from "../../utils";
import styles from "./CandidateModal.module.css";

// Fase 2: quando o candidato já tiver um convite salvo, passamos os dados aqui
// para exibir o link do Meet. Enquanto isso, a presença de `scheduling` apenas
// troca o botão por "usuário já tem agendamento".
type Scheduling = { meetLink: string | null };

type CandidateModalProps = {
  card: BoardCardDTO | null;
  scheduling?: Scheduling | null;
  onClose: () => void;
};

export function CandidateModal({
  card,
  scheduling,
  onClose,
}: CandidateModalProps) {
  const t = useTranslations("Dashboard");
  const tStages = useTranslations("Dashboard.stages");
  const router = useRouter();

  if (!card) return null;

  const accentStyle = { "--stage-accent": STAGE_ACCENT[card.stage] } as CSSProperties;

  function scheduleMeeting() {
    if (!card) return;
    router.push(
      `/agendar?candidate=${encodeURIComponent(card.candidateName)}&candidateId=${encodeURIComponent(card.id)}`,
    );
  }

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
          {scheduling ? (
            <p className={styles.scheduled}>{t("alreadyScheduled")}</p>
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
