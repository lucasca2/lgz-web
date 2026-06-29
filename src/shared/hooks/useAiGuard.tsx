"use client";

import { useState } from "react";
import { AiNotConfiguredModal } from "@/shared/ui/AiNotConfiguredModal";
import { useAiCredentialStatus } from "./useAiCredentialStatus";

// Guarda ações de IA: `ensure(action)` roda a ação se houver credencial; senão
// abre o modal "IA não configurada". Renderize `modal` no componente.
// Enquanto o status ainda carrega (data === undefined), deixa a ação passar
// (o servidor ainda valida) — só bloqueia quando SABE que não há credencial.
export function useAiGuard() {
  const { data } = useAiCredentialStatus();
  const [open, setOpen] = useState(false);

  function ensure(action: () => void) {
    if (data && !data.configured) {
      setOpen(true);
      return;
    }
    action();
  }

  const modal = (
    <AiNotConfiguredModal open={open} onClose={() => setOpen(false)} />
  );

  return { ensure, modal };
}
