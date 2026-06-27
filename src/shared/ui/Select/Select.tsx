"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { ChevronDownIcon, CheckIcon } from "@/shared/ui/icons";
import styles from "./Select.module.css";

export type SelectOption = {
  value: string;
  label: string;
  /** Elemento opcional à esquerda do label (ex.: bolinha de status, ícone). */
  icon?: ReactNode;
};

type SelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  error?: string;
  /** Esconde o label visualmente (mantém acessível). */
  hideLabel?: boolean;
  placeholder?: string;
  id?: string;
  name?: string;
};

export function Select({
  label,
  value,
  onChange,
  options,
  error,
  hideLabel = false,
  placeholder,
  id,
  name,
}: SelectProps) {
  const reactId = useId();
  const selectId = id ?? name ?? reactId;
  const labelId = `${selectId}-label`;
  const listId = `${selectId}-listbox`;
  const errorId = error ? `${selectId}-error` : undefined;

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;

    function handleOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  function openMenu() {
    const current = options.findIndex((option) => option.value === value);
    setActiveIndex(current >= 0 ? current : 0);
    setOpen(true);
  }

  function commit(index: number) {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    setOpen(false);
    buttonRef.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!open) return openMenu();
        setActiveIndex((index) => Math.min(options.length - 1, index + 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        if (!open) return openMenu();
        setActiveIndex((index) => Math.max(0, index - 1));
        break;
      case "Home":
        if (open) {
          event.preventDefault();
          setActiveIndex(0);
        }
        break;
      case "End":
        if (open) {
          event.preventDefault();
          setActiveIndex(options.length - 1);
        }
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (!open) return openMenu();
        commit(activeIndex);
        break;
      case "Escape":
        if (open) {
          event.preventDefault();
          setOpen(false);
        }
        break;
      case "Tab":
        if (open) setOpen(false);
        break;
    }
  }

  return (
    <div className={styles.field} ref={rootRef}>
      <label
        id={labelId}
        htmlFor={selectId}
        className={hideLabel ? styles.srOnly : styles.label}
      >
        {label}
      </label>

      <div className={styles.control}>
        <button
          ref={buttonRef}
          type="button"
          id={selectId}
          name={name}
          className={[
            styles.trigger,
            error && styles.triggerError,
            open && styles.triggerOpen,
          ]
            .filter(Boolean)
            .join(" ")}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-labelledby={`${labelId} ${selectId}`}
          aria-activedescendant={
            open ? `${selectId}-opt-${activeIndex}` : undefined
          }
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          onClick={() => (open ? setOpen(false) : openMenu())}
          onKeyDown={handleKeyDown}
        >
          <span className={selected ? styles.value : styles.placeholder}>
            {selected?.icon ? (
              <span className={styles.optionIcon}>{selected.icon}</span>
            ) : null}
            {selected ? selected.label : (placeholder ?? "")}
          </span>
          <ChevronDownIcon className={styles.chevron} />
        </button>

        {open ? (
          <ul className={styles.menu} role="listbox" id={listId} aria-labelledby={labelId}>
            {options.map((option, index) => (
              <li
                key={option.value}
                id={`${selectId}-opt-${index}`}
                role="option"
                aria-selected={option.value === value}
                className={[
                  styles.option,
                  index === activeIndex && styles.optionActive,
                  option.value === value && styles.optionSelected,
                ]
                  .filter(Boolean)
                  .join(" ")}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(event) => {
                  event.preventDefault();
                  commit(index);
                }}
              >
                <span className={styles.optionLabel}>
                  {option.icon ? (
                    <span className={styles.optionIcon}>{option.icon}</span>
                  ) : null}
                  {option.label}
                </span>
                {option.value === value ? (
                  <CheckIcon className={styles.check} />
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {error ? (
        <span id={errorId} className={styles.error} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
