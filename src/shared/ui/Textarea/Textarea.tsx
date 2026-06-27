import type { TextareaHTMLAttributes } from "react";
import styles from "./Textarea.module.css";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  /** Esconde o label visualmente (mantém acessível). */
  hideLabel?: boolean;
};

export function Textarea({
  label,
  error,
  hideLabel = false,
  id,
  name,
  className,
  rows = 4,
  ...props
}: TextareaProps) {
  const fieldId = id ?? name;
  const errorId = error && fieldId ? `${fieldId}-error` : undefined;

  return (
    <div className={styles.field}>
      <label
        htmlFor={fieldId}
        className={hideLabel ? styles.srOnly : styles.label}
      >
        {label}
      </label>
      <textarea
        id={fieldId}
        name={name}
        rows={rows}
        className={[styles.textarea, error && styles.textareaError, className]
          .filter(Boolean)
          .join(" ")}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        {...props}
      />
      {error ? (
        <span id={errorId} className={styles.error} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
