"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./Modal.module.css";

// Pilha de modais abertos. Só o modal do topo responde ao Escape — assim um
// modal aninhado não fecha também o modal de baixo.
const modalStack: symbol[] = [];

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

export function Modal({ open, onClose, title, children }: ModalProps) {
  // Token estável por instância + ref do onClose (pra não re-inscrever o
  // listener a cada render, o que bagunçaria a ordem da pilha).
  const tokenRef = useRef<symbol | null>(null);
  if (tokenRef.current === null) tokenRef.current = Symbol("modal");
  const token = tokenRef.current;

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;

    modalStack.push(token);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (modalStack[modalStack.length - 1] !== token) return;
      onCloseRef.current();
    }

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      const idx = modalStack.lastIndexOf(token);
      if (idx !== -1) modalStack.splice(idx, 1);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, token]);

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 id="modal-title" className={styles.title}>
            {title}
          </h2>
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
