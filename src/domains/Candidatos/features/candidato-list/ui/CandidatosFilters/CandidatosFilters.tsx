"use client";

import { useTranslations } from "next-intl";
import { TextField } from "@/shared/ui/TextField";
import { origemValues } from "../../schemas/candidatoFilterSchema";
import type { OrigenCandidato } from "../../types";
import styles from "./CandidatosFilters.module.css";

type Props = {
  q: string;
  origem: OrigenCandidato | "";
  onQChange: (q: string) => void;
  onOrigemChange: (origem: OrigenCandidato | "") => void;
};

export function CandidatosFilters({ q, origem, onQChange, onOrigemChange }: Props) {
  const t = useTranslations("Candidatos.filters");

  return (
    <div className={styles.filters}>
      <div className={styles.search}>
        <TextField
          name="q"
          label={t("search")}
          hideLabel
          placeholder={t("search")}
          value={q}
          onChange={(e) => onQChange(e.target.value)}
          type="search"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="origem-filter">
          {t("origem")}
        </label>
        <select
          id="origem-filter"
          className={styles.select}
          value={origem}
          onChange={(e) => onOrigemChange(e.target.value as OrigenCandidato | "")}
        >
          <option value="">{t("all")}</option>
          {origemValues.map((o) => (
            <option key={o} value={o}>
              {o === "Indicacao" ? "Indicação" : o}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
