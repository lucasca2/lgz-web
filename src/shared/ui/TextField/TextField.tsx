import type { InputHTMLAttributes } from "react";
import styles from "./TextField.module.css";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  /** Esconde o label visualmente (mantém acessível); usa o placeholder como rótulo. */
  hideLabel?: boolean;
};

export function TextField({
  label,
  error,
  hideLabel = false,
  id,
  name,
  className,
  ...props
}: TextFieldProps) {
  const inputId = id ?? name;
  const errorId = error && inputId ? `${inputId}-error` : undefined;

  return (
    <div className={styles.field}>
      <label
        htmlFor={inputId}
        className={hideLabel ? styles.srOnly : styles.label}
      >
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        className={[styles.input, error && styles.inputError, className]
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
