"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/Button";
import { Select } from "@/shared/ui/Select";
import { TextField } from "@/shared/ui/TextField";
import { Textarea } from "@/shared/ui/Textarea";
import { useAssessmentSettings, useUpdateSettings } from "../../hooks";
import { SetupTokenHelp } from "../../ui/SetupTokenHelp";
import type { AiSettingsDTO } from "../../types";
import styles from "./AssessmentSettingsScreen.module.css";

const PROMPT_FIELDS = [
  { key: "analysisPrompt", labelKey: "prompts.analysis" },
  { key: "summaryPrompt", labelKey: "prompts.summary" },
  { key: "recommendationPrompt", labelKey: "prompts.recommendation" },
  { key: "rejectionTemplatePrompt", labelKey: "prompts.rejection" },
] as const;

// Sentinela exibida quando já há credencial salva (o valor real nunca volta do
// servidor — é write-only). Igual a MASK no save = "não alterar".
const MASK = "••••••••••••";

export function AssessmentSettingsScreen() {
  const t = useTranslations("Settings");
  const { data, isPending, isError } = useAssessmentSettings();
  const update = useUpdateSettings();

  const [form, setForm] = useState<AiSettingsDTO | null>(null);
  // Credenciais write-only: pré-preenchidas com MASK quando já configuradas.
  const [setupToken, setSetupToken] = useState("");
  const [apiKey, setApiKey] = useState("");
  // Método de credencial selecionado no toggle (setup token OU API key).
  const [method, setMethod] = useState<"setup" | "apikey">("setup");

  // Hidrata (uma vez): form, método inicial e máscaras conforme o que já existe.
  useEffect(() => {
    if (data && !form) {
      setForm(data.settings);
      setMethod(data.hasApiKey && !data.hasSetupToken ? "apikey" : "setup");
      setSetupToken(data.hasSetupToken ? MASK : "");
      setApiKey(data.hasApiKey ? MASK : "");
    }
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

  // Reaplica as máscaras conforme a resposta (após salvar/remover credencial).
  function remask(res: { hasSetupToken: boolean; hasApiKey: boolean }) {
    setSetupToken(res.hasSetupToken ? MASK : "");
    setApiKey(res.hasApiKey ? MASK : "");
  }

  const isSetup = method === "setup";
  const credValue = isSetup ? setupToken : apiKey;
  const setCredValue = isSetup ? setSetupToken : setApiKey;
  const credConfigured = isSetup ? data.hasSetupToken : data.hasApiKey;

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

        <div className={styles.divider} />

        <div className={styles.cardHeader}>
          <div className={styles.labelRow}>
            <label className={styles.cardLabel}>{t("credential.label")}</label>
            {isSetup ? <SetupTokenHelp /> : null}
          </div>
          <span className={styles.defaultTag}>
            {data.hasSetupToken
              ? t("credential.statusSetup")
              : data.hasApiKey
                ? t("credential.statusApiKey")
                : t("credential.statusNone")}
          </span>
        </div>

        <div
          className={styles.segmented}
          role="group"
          aria-label={t("credential.methodLabel")}
        >
          <button
            type="button"
            className={isSetup ? styles.segActive : styles.seg}
            aria-pressed={isSetup}
            onClick={() => setMethod("setup")}
          >
            {t("credential.setupOption")}
          </button>
          <button
            type="button"
            className={!isSetup ? styles.segActive : styles.seg}
            aria-pressed={!isSetup}
            onClick={() => setMethod("apikey")}
          >
            {t("credential.apiKeyOption")}
          </button>
        </div>

        <TextField
          label={isSetup ? t("setupToken.label") : t("apiKey.label")}
          hideLabel
          name={isSetup ? "setupToken" : "apiKey"}
          type="password"
          autoComplete="off"
          placeholder={
            isSetup ? t("setupToken.placeholder") : t("apiKey.placeholder")
          }
          value={credValue}
          onChange={(event) => setCredValue(event.target.value)}
          onFocus={() => {
            if (credValue === MASK) setCredValue("");
          }}
          onBlur={() => {
            if (credValue === "" && credConfigured) setCredValue(MASK);
          }}
        />
        {!isSetup ? <p className={styles.hint}>{t("apiKey.hint")}</p> : null}

        {data.hasSetupToken || data.hasApiKey ? (
          <button
            type="button"
            className={styles.restore}
            disabled={update.isPending}
            onClick={() => {
              if (!form) return;
              update.mutate(
                { ...form, setupToken: "", apiKey: "" },
                { onSuccess: remask },
              );
            }}
          >
            {t("credential.remove")}
          </button>
        ) : null}
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
          onClick={() => {
            if (!form) return;
            const raw = isSetup ? setupToken : apiKey;
            // MASK = inalterado → não envia. Credencial única: ao gravar um
            // método, limpa o outro.
            const cred = raw === MASK ? "" : raw.trim();
            const payload = cred
              ? isSetup
                ? { ...form, setupToken: cred, apiKey: "" }
                : { ...form, apiKey: cred, setupToken: "" }
              : form;
            update.mutate(payload, { onSuccess: remask });
          }}
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
