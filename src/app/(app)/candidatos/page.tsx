import { Suspense } from "react";
import { CandidatosListScreen } from "@/domains/Candidatos/features/candidato-list/screens";

export default function CandidatosPage() {
  return (
    <Suspense>
      <CandidatosListScreen />
    </Suspense>
  );
}
