"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
} from "react";

import { Icon } from "@/components/icons/icon";

export interface SelectOption {
  value: string;
  label: string;
  keywords?: string;
  status?: string;
}

interface SharedProps {
  ariaLabel: string;
  className?: string;
  disabled?: boolean;
  options: SelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
}

interface SearchableSelectProps extends SharedProps {
  onChange: (value: string) => void;
  value: string;
}

interface SearchableMultiSelectProps extends SharedProps {
  onChange: (value: string[]) => void;
  value: string[];
}

export function SearchableSelect({
  ariaLabel,
  className,
  disabled = false,
  onChange,
  options,
  placeholder = "Select an option",
  searchPlaceholder = "Search options",
  value,
}: SearchableSelectProps) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = options.find((option) => option.value === value);
  const visibleOptions = useFilteredOptions(options, query);

  useDismiss(rootRef, open, () => setOpen(false));
  useSearchFocus(searchRef, open);

  function close() {
    setOpen(false);
    setQuery("");
  }

  function choose(nextValue: string) {
    onChange(nextValue);
    close();
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (
      event.key === "ArrowDown" ||
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      setOpen(true);
    }
  }

  return (
    <div
      className={`searchable-select${open ? " is-open" : ""}${className ? ` ${className}` : ""}`}
      ref={rootRef}
    >
      <button
        type="button"
        className="searchable-select-trigger"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        aria-haspopup="listbox"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={handleTriggerKeyDown}
      >
        <span className={!selected ? "is-placeholder" : undefined}>
          {selected?.status ? (
            <i className={`select-status-dot status-${selected.status}`} />
          ) : null}
          {selected?.label ?? placeholder}
        </span>
        <Icon name="arrowDown" />
      </button>

      {open ? (
        <div className="searchable-select-popover">
          <div className="searchable-select-search">
            <Icon name="search" />
            <input
              ref={searchRef}
              type="search"
              aria-label={searchPlaceholder}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") close();
                if (event.key === "Enter" && visibleOptions[0]) {
                  event.preventDefault();
                  choose(visibleOptions[0].value);
                }
              }}
              placeholder={searchPlaceholder}
            />
          </div>
          <div
            className="searchable-select-options"
            id={`${id}-listbox`}
            role="listbox"
            aria-label={ariaLabel}
          >
            {visibleOptions.map((option) => (
              <button
                type="button"
                role="option"
                aria-selected={option.value === value}
                className={option.value === value ? "is-selected" : undefined}
                key={option.value}
                onClick={() => choose(option.value)}
              >
                <span>
                  {option.status ? (
                    <i
                      className={`select-status-dot status-${option.status}`}
                    />
                  ) : null}
                  {option.label}
                </span>
                {option.value === value ? <Icon name="checkCircle" /> : null}
              </button>
            ))}
            {!visibleOptions.length ? (
              <p className="searchable-select-empty">No options found</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function SearchableMultiSelect({
  ariaLabel,
  className,
  disabled = false,
  onChange,
  options,
  placeholder = "Select options",
  searchPlaceholder = "Search options",
  value,
}: SearchableMultiSelectProps) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const visibleOptions = useFilteredOptions(options, query);
  const selectedLabels = options
    .filter((option) => value.includes(option.value))
    .map((option) => option.label);

  useDismiss(rootRef, open, () => setOpen(false));
  useSearchFocus(searchRef, open);

  function toggle(nextValue: string) {
    onChange(
      value.includes(nextValue)
        ? value.filter((item) => item !== nextValue)
        : [...value, nextValue],
    );
  }

  return (
    <div
      className={`searchable-select searchable-multi-select${open ? " is-open" : ""}${className ? ` ${className}` : ""}`}
      ref={rootRef}
    >
      <button
        type="button"
        className="searchable-select-trigger"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        aria-haspopup="listbox"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
      >
        <span className={!selectedLabels.length ? "is-placeholder" : undefined}>
          {selectedLabels.length
            ? selectedLabels.length === 1
              ? selectedLabels[0]
              : `${selectedLabels.length} selected`
            : placeholder}
        </span>
        <Icon name="arrowDown" />
      </button>

      {open ? (
        <div className="searchable-select-popover">
          <div className="searchable-select-search">
            <Icon name="search" />
            <input
              ref={searchRef}
              type="search"
              aria-label={searchPlaceholder}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setOpen(false);
                  setQuery("");
                }
              }}
              placeholder={searchPlaceholder}
            />
          </div>
          <div
            className="searchable-select-options"
            id={`${id}-listbox`}
            role="listbox"
            aria-label={ariaLabel}
            aria-multiselectable="true"
          >
            {visibleOptions.map((option) => {
              const selected = value.includes(option.value);
              return (
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={selected ? "is-selected" : undefined}
                  key={option.value}
                  onClick={() => toggle(option.value)}
                >
                  <span>{option.label}</span>
                  {selected ? <Icon name="checkCircle" /> : null}
                </button>
              );
            })}
            {!visibleOptions.length ? (
              <p className="searchable-select-empty">No options found</p>
            ) : null}
          </div>
          <button
            className="searchable-select-done"
            type="button"
            onClick={() => {
              setOpen(false);
              setQuery("");
            }}
          >
            Done
          </button>
        </div>
      ) : null}
    </div>
  );
}

function useFilteredOptions(options: SelectOption[], query: string) {
  return useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    if (!needle) return options;
    return options.filter((option) =>
      `${option.label} ${option.keywords ?? ""}`
        .toLocaleLowerCase()
        .includes(needle),
    );
  }, [options, query]);
}

function useDismiss(
  rootRef: RefObject<HTMLDivElement | null>,
  open: boolean,
  close: () => void,
) {
  useEffect(() => {
    if (!open) return;
    function dismiss(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) close();
    }
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [close, open, rootRef]);
}

function useSearchFocus(
  searchRef: RefObject<HTMLInputElement | null>,
  open: boolean,
) {
  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open, searchRef]);
}
