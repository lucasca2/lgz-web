import { Suspense } from "react";
import { FunilScreen } from "@/domains/Analytics/features/funil-overview/screens";

export default function FunilPage() {
  return (
    <Suspense>
      <FunilScreen />
    </Suspense>
  );
}
