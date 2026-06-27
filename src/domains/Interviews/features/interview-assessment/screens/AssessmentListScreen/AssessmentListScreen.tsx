"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations, useFormatter } from "next-intl";
import { Button } from "@/shared/ui/Button";
import { TextField } from "@/shared/ui/TextField";
import { PlusIcon } from "@/shared/ui/icons";
import { useAssessments, useDeleteAssessment } from "../../hooks";
import { StatusBadge } from "../../ui/StatusBadge";
import { statusOf } from "../../utils/status";
import type { AssessmentStatusFilter } from "../../types";
import styles from "./AssessmentListScreen.module.css";

const FILTERS: AssessmentStatusFilter[] = [
  "all",
  "approved",
  "rejected",
  "pending",
  "draft",
];

export function AssessmentListScreen() {
  const t = useTranslations("Assessments");
  const format = useFormatter();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<AssessmentStatusFilter>("all");
  const [page, setPage] = useState(1);

  const { data, isPending, isError } = useAssessments({
    page,
    limit: 20,
    status,
    search,
  });
  const remove = useDeleteAssessment();

  function handleDelete(id: string) {
    if (window.confirm(t("delete.confirm"))) remove.mutate(id);
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{t("title")}</h1>
          <p className={styles.subtitle}>{t("subtitle")}</p>
        </div>
        <Link href="/avaliacoes/nova" className={styles.cta}>
          <Button size="md">
            <PlusIcon />
            {t("create")}
          </Button>
        </Link>
      </header>

      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <TextField
            label={t("searchLabel")}
            hideLabel
            name="search"
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className={styles.pills}>
          {FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              className={[styles.pill, status === filter && styles.pillActive]
                .filter(Boolean)
                .join(" ")}
              onClick={() => {
                setStatus(filter);
                setPage(1);
              }}
            >
              {filter === "all" ? t("filters.all") : t(`status.${filter}`)}
            </button>
          ))}
        </div>
      </div>

      {isPending ? (
        <p className={styles.state}>{t("loading")}</p>
      ) : isError ? (
        <p className={styles.stateError}>{t("loadError")}</p>
      ) : data.items.length === 0 ? (
        <p className={styles.state}>{t("empty")}</p>
      ) : (
        <>
          <ul className={styles.list}>
            {data.items.map((item) => (
              <li key={item.id} className={styles.row}>
                <Link href={`/avaliacoes/${item.id}`} className={styles.rowMain}>
                  <span className={styles.candidate}>{item.candidateName}</span>
                  <span className={styles.cargo}>
                    {item.posicaoNome
                      ? `${item.posicaoNome} · ${item.posicaoNivel}`
                      : (item.cargo ?? "—")}
                  </span>
                  <span className={styles.meta}>
                    {format.dateTime(new Date(item.createdAt), {
                      dateStyle: "short",
                    })}{" "}
                    · {t("charsCount", { count: item.transcriptChars })}
                  </span>
                </Link>
                <div className={styles.rowSide}>
                  <StatusBadge status={statusOf(item)} />
                  <button
                    type="button"
                    className={styles.delete}
                    aria-label={t("delete.action")}
                    onClick={() => handleDelete(item.id)}
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {data.pagination.totalPages > 1 ? (
            <div className={styles.pagination}>
              <Button
                variant="ghost"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((current) => current - 1)}
              >
                {t("prev")}
              </Button>
              <span className={styles.pageInfo}>
                {t("pageInfo", {
                  page: data.pagination.page,
                  total: data.pagination.totalPages,
                })}
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={page >= data.pagination.totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                {t("next")}
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
