"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/Button";
import { TextField } from "@/shared/ui/TextField";
import { Modal } from "@/shared/ui/Modal";
import { CheckIcon } from "@/shared/ui/icons";
import {
  useDirectorySearch,
  type DirectoryErrorCode,
} from "../../hooks";
import { Avatar } from "../Avatar";
import styles from "./ParticipantsModal.module.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type AddedPerson = {
  email: string;
  name?: string;
  picture?: string | null;
  required?: boolean;
};

type ParticipantsModalProps = {
  open: boolean;
  onClose: () => void;
  existingEmails: string[];
  onAdd: (person: AddedPerson) => void;
};

export function ParticipantsModal({
  open,
  onClose,
  existingEmails,
  onAdd,
}: ParticipantsModalProps) {
  const t = useTranslations("Scheduling.recruiter");

  const [term, setTerm] = useState("");
  const [debounced, setDebounced] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [manualError, setManualError] = useState<string | null>(null);

  // Debounce da busca (evita uma chamada por tecla).
  useEffect(() => {
    const id = setTimeout(() => setDebounced(term), 250);
    return () => clearTimeout(id);
  }, [term]);

  // Limpa o estado ao fechar.
  useEffect(() => {
    if (!open) {
      setTerm("");
      setDebounced("");
      setManualEmail("");
      setManualError(null);
    }
  }, [open]);

  const search = useDirectorySearch(debounced);
  const added = new Set(existingEmails.map((e) => e.toLowerCase()));

  const errorCode = (search.error as { code?: DirectoryErrorCode } | null)
    ?.code;

  function addManual() {
    const email = manualEmail.trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      setManualError(t("emailInvalid"));
      return;
    }
    if (!email.endsWith("@bemobi.com")) {
      setManualError(t("emailNotBemobi"));
      return;
    }
    onAdd({ email });
    setManualEmail("");
    setManualError(null);
  }

  const results = search.data ?? [];

  return (
    <Modal open={open} onClose={onClose} title={t("participantsModalTitle")}>
      <div className={styles.content}>
        <TextField
          label={t("directorySearchLabel")}
          hideLabel
          type="search"
          placeholder={t("directorySearchPlaceholder")}
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          autoFocus
        />

        <div className={styles.results}>
          {debounced.trim().length < 2 ? (
            <p className={styles.hint}>{t("directoryHint")}</p>
          ) : search.isFetching ? (
            <p className={styles.hint}>{t("searching")}</p>
          ) : errorCode === "RELOGIN" ? (
            <p className={styles.notice}>{t("directoryRelogin")}</p>
          ) : errorCode === "UNAVAILABLE" ? (
            <p className={styles.notice}>{t("directoryUnavailable")}</p>
          ) : search.isError ? (
            <p className={styles.notice}>{t("directoryError")}</p>
          ) : results.length === 0 ? (
            <p className={styles.hint}>{t("directoryEmpty")}</p>
          ) : (
            <ul className={styles.list}>
              {results.map((person) => {
                const isAdded = added.has(person.email);
                return (
                  <li key={person.email} className={styles.row}>
                    <Avatar
                      email={person.email}
                      name={person.name}
                      picture={person.photo}
                    />
                    <div className={styles.person}>
                      <span className={styles.personName}>{person.name}</span>
                      <span className={styles.personEmail}>{person.email}</span>
                    </div>
                    {isAdded ? (
                      <span className={styles.addedTag}>
                        <CheckIcon className={styles.addedIcon} />
                        {t("added")}
                      </span>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        onClick={() =>
                          onAdd({
                            email: person.email,
                            name: person.name,
                            picture: person.photo,
                          })
                        }
                      >
                        {t("add")}
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className={styles.external}>
          <span className={styles.externalLabel}>{t("externalGuest")}</span>
          <div className={styles.externalRow}>
            <div className={styles.externalField}>
              <TextField
                label={t("addParticipant")}
                hideLabel
                type="email"
                placeholder={t("addParticipantPlaceholder")}
                value={manualEmail}
                error={manualError ?? undefined}
                onChange={(e) => {
                  setManualEmail(e.target.value);
                  if (manualError) setManualError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addManual();
                  }
                }}
              />
            </div>
            <Button variant="ghost" type="button" onClick={addManual}>
              {t("add")}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
