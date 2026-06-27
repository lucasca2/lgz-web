"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/Button";
import { Select } from "@/shared/ui/Select";
import { Textarea } from "@/shared/ui/Textarea";
import { useAssessmentSettings, useUpdateSettings } from "../../hooks";
import type { AiSettingsDTO } from "../../types";
import styles from "./AssessmentSettingsScreen.module.css";

const PROMPT_FIELDS = [
  { key: "analysisPrompt", labelKey: "prompts.analysis" },
  { key: "summaryPrompt", labelKey: "prompts.summary" },
  { key: "recommendationPrompt", labelKey: "prompts.recommendation" },
  { key: "rejectionTemplatePrompt", labelKey: "prompts.rejection" },
] as const;

export function AssessmentSettingsScreen() {
  const t = useTranslations("Settings");
  const { data, isPending, isError } = useAssessmentSettings();
  const update = useUpdateSettings();

  const [form, setForm] = useState<AiSettingsDTO | null>(null);

  // Hidrata o formulário quando os dados chegam (uma vez).
  useEffect(() => {
    if (data && !form) setForm(data.settings);
  }, [data, form]);

  if (isPending || !form) {
    return (
      <div className={styles.page}>
        <Header t={t} />
        <p className={styles.state}>{t("loading")}</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.page}>
        <Header t={t} />
        <p className={styles.stateError}>{t("loadError")}</p>
      </div>
    );
  }

  const defaults = data.defaults;
  const modelOptions = [
    ...data.availableModels.map((model) => ({
      value: model.id,
      label: model.label,
    })),
    ...(data.availableModels.some((model) => model.id === form.model)
      ? []
      : [{ value: form.model, label: form.model }]),
  ];

  function setField(key: keyof AiSettingsDTO, value: string) {
    setForm((current) => (current ? { ...current, [key]: value } : current));
  }

  return (
    <div className={styles.page}>
      <Header t={t} />

      <div className={styles.card}>
        <Select
          label={t("model.label")}
          name="model"
          value={form.model}
          onChange={(value) => setField("model", value)}
          options={modelOptions}
        />
        <p className={styles.hint}>{t("model.hint")}</p>
      </div>

      {PROMPT_FIELDS.map((field) => {
        const isDefault = form[field.key] === defaults[field.key];
        return (
          <div key={field.key} className={styles.card}>
            <div className={styles.cardHeader}>
              <label className={styles.cardLabel}>{t(field.labelKey)}</label>
              <div className={styles.cardHeaderSide}>
                {isDefault ? (
                  <span className={styles.defaultTag}>{t("usingDefault")}</span>
                ) : null}
                <button
                  type="button"
                  className={styles.restore}
                  onClick={() => setField(field.key, defaults[field.key])}
                  disabled={isDefault}
                >
                  {t("restore")}
                </button>
              </div>
            </div>
            <Textarea
              label={t(field.labelKey)}
              hideLabel
              name={field.key}
              value={form[field.key]}
              onChange={(event) => setField(field.key, event.target.value)}
              rows={10}
              className={styles.mono}
            />
          </div>
        );
      })}

      <div className={styles.actions}>
        {update.isSuccess ? (
          <span className={styles.saved}>{t("saved")}</span>
        ) : null}
        {update.isError ? (
          <span className={styles.errorText}>{t("error")}</span>
        ) : null}
        <Button
          type="button"
          size="md"
          loading={update.isPending}
          onClick={() => form && update.mutate(form)}
        >
          {t("save")}
        </Button>
      </div>
    </div>
  );
}

function Header({ t }: { t: (key: string) => string }) {
  return (
    <header>
      <h1 className={styles.title}>{t("title")}</h1>
      <p className={styles.subtitle}>{t("subtitle")}</p>
    </header>
  );
}
