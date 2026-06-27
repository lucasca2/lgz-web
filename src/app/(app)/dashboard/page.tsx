import { Suspense } from "react";
import { FunilScreen } from "@/domains/Analytics/features/funil-overview/screens";

// O dashboard agora é o funil de recrutamento. O board de candidatos é acessado
// por vaga em /jobs/[id] (JobDetailScreen).
export default function DashboardPage() {
  return (
    <Suspense>
      <FunilScreen />
    </Suspense>
  );
}
