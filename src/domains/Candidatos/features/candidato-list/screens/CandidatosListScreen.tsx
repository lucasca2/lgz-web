"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCandidatos } from "../hooks/queries";
import { CandidatosFilters } from "../ui/CandidatosFilters";
import { CandidatosTable } from "../ui/CandidatosTable";
import { Pagination } from "../ui/Pagination";
import type { OrigenCandidato } from "../types";
import styles from "./CandidatosListScreen.module.css";

const PAGE_SIZE = 20;

export function CandidatosListScreen() {
  const t = useTranslations("Candidatos");
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlQ = searchParams.get("q") ?? "";
  const urlOrigem = (searchParams.get("origem") as OrigenCandidato | null) ?? undefined;
  const urlPage = Number(searchParams.get("page") ?? "1");

  const [localQ, setLocalQ] = useState(urlQ);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timeout = setTimeout(() => {
      const sp = new URLSearchParams(window.location.search);
      if (localQ) sp.set("q", localQ);
      else sp.delete("q");
      sp.set("page", "1");
      router.push(`/candidatos?${sp}`, { scroll: false });
    }, 300);
    return () => clearTimeout(timeout);
  }, [localQ]);

  function setOrigem(newOrigem: OrigenCandidato | "") {
    const sp = new URLSearchParams(window.location.search);
    if (newOrigem) sp.set("origem", newOrigem);
    else sp.delete("origem");
    sp.set("page", "1");
    router.push(`/candidatos?${sp}`, { scroll: false });
  }

  function setPage(newPage: number) {
    const sp = new URLSearchParams(window.location.search);
    sp.set("page", String(newPage));
    router.push(`/candidatos?${sp}`, { scroll: false });
  }

  const { data, isFetching } = useCandidatos({
    q: urlQ || undefined,
    origem: urlOrigem,
    page: urlPage,
    pageSize: PAGE_SIZE,
  });

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{t("title")}</h1>

      <CandidatosFilters
        q={localQ}
        origem={urlOrigem ?? ""}
        onQChange={setLocalQ}
        onOrigemChange={setOrigem}
      />

      <CandidatosTable candidatos={data?.data ?? []} loading={isFetching} />

      {data && data.totalPages > 1 && (
        <Pagination
          page={urlPage}
          totalPages={data.totalPages}
          total={data.total}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
