"use client";

import { Children, isValidElement, useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { DateInput } from "./DatePicker";

export function Input({
  label,
  error,
  hint,
  className,
  id,
  required,
  type = "text",
  ...props
}) {
  if (type === "date") {
    return (
      <DateInput
        label={label}
        error={error}
        hint={hint}
        className={className}
        id={id}
        required={required}
        {...props}
      />
    );
  }

  const inputId = id || props.name;
  return (
    <div className="space-y-1.5">
      {label ? (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-800 dark:text-slate-200">
          {label}
          {required ? <span className="ml-0.5 text-danger">*</span> : null}
        </label>
      ) : null}
      <input
        id={inputId}
        type={type}
        className={cn(
          "h-10 w-full rounded-lg border border-[#d5e3df] bg-cream px-3 text-sm text-nexus-900 placeholder:text-nexus-400/70 focus:border-nexus-600 focus:outline-none focus:ring-2 focus:ring-nexus-600/20 dark:border-nexus-700 dark:bg-nexus-900 dark:text-cream",
          error && "border-danger focus:border-danger focus:ring-danger/20",
          className
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        {...props}
      />
      {hint && !error ? (
        <p id={`${inputId}-hint`} className="text-xs text-secondary">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${inputId}-error`} className="text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Textarea({ label, error, hint, className, id, required, ...props }) {
  const inputId = id || props.name;
  return (
    <div className="space-y-1.5">
      {label ? (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-800 dark:text-slate-200">
          {label}
          {required ? <span className="ml-0.5 text-danger">*</span> : null}
        </label>
      ) : null}
      <textarea
        id={inputId}
        className={cn(
          "min-h-24 w-full rounded-lg border border-[#d5e3df] bg-cream px-3 py-2 text-sm text-nexus-900 placeholder:text-nexus-400/70 focus:border-nexus-600 focus:outline-none focus:ring-2 focus:ring-nexus-600/20 dark:border-nexus-700 dark:bg-nexus-900 dark:text-cream",
          error && "border-danger focus:border-danger focus:ring-danger/20",
          className
        )}
        {...props}
      />
      {hint && !error ? <p className="text-xs text-secondary">{hint}</p> : null}
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}

function normalizeOption(opt) {
  if (opt == null) return null;
  if (typeof opt === "object") {
    return {
      value: String(opt.value ?? ""),
      label: String(opt.label ?? opt.value ?? ""),
      disabled: Boolean(opt.disabled),
    };
  }
  return { value: String(opt), label: String(opt), disabled: false };
}

function optionsFromChildren(children) {
  return Children.toArray(children)
    .filter((child) => isValidElement(child) && child.type === "option")
    .map((child) => ({
      value: child.props.value == null ? "" : String(child.props.value),
      label: String(child.props.children ?? child.props.value ?? ""),
      disabled: Boolean(child.props.disabled),
    }));
}

export function Select({
  label,
  error,
  hint,
  className,
  id,
  required,
  options = [],
  placeholder,
  children,
  value,
  defaultValue,
  onChange,
  name,
  disabled = false,
}) {
  const autoId = useId();
  const inputId = id || name || autoId;
  const listId = `${inputId}-listbox`;
  const ref = useRef(null);
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(
    defaultValue == null ? "" : String(defaultValue)
  );

  const isControlled = value !== undefined;
  const currentValue = isControlled
    ? value == null
      ? ""
      : String(value)
    : internalValue;

  const items = useMemo(() => {
    const fromProps = (options || []).map(normalizeOption).filter(Boolean);
    const fromChildren = optionsFromChildren(children);
    const merged = [...fromChildren, ...fromProps];
    if (placeholder != null) {
      const hasEmpty = merged.some((item) => item.value === "");
      if (!hasEmpty) {
        return [{ value: "", label: String(placeholder), disabled: false }, ...merged];
      }
    }
    return merged;
  }, [options, children, placeholder]);

  const selected = items.find((item) => item.value === currentValue) || null;

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const commit = (next) => {
    if (!isControlled) setInternalValue(next);
    onChange?.({
      target: { name, value: next },
      currentTarget: { name, value: next },
    });
    setOpen(false);
  };

  return (
    <div className={cn("relative space-y-1.5", className)} ref={ref}>
      {label ? (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-800 dark:text-slate-200">
          {label}
          {required ? <span className="ml-0.5 text-danger">*</span> : null}
        </label>
      ) : null}

      <button
        id={inputId}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => {
          if (!disabled) setOpen((v) => !v);
        }}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-[#d5e3df] bg-cream px-3 text-left text-sm text-nexus-900 transition-colors focus:border-nexus-600 focus:outline-none focus:ring-2 focus:ring-nexus-600/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-nexus-700 dark:bg-nexus-900 dark:text-cream",
          error && "border-danger focus:border-danger focus:ring-danger/20",
          open && "border-nexus-600 ring-2 ring-nexus-600/20"
        )}
      >
        <span className={cn("min-w-0 truncate", (!selected || selected.value === "") && "text-slate-400")}>
          {selected?.label || placeholder || "Select"}
        </span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-slate-400 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-labelledby={inputId}
          className="absolute z-50 mt-1.5 max-h-64 min-w-full w-max overflow-auto rounded-xl border border-[#d5e3df] bg-cream py-1 shadow-xl dark:border-nexus-700 dark:bg-nexus-900"
        >
          {items.map((item) => {
            const isSelected = item.value === currentValue;
            return (
              <li key={`${item.value}::${item.label}`}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={item.disabled}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors",
                    item.disabled && "cursor-not-allowed opacity-40",
                    isSelected
                      ? "bg-nexus-600 font-medium text-white"
                      : "text-nexus-800 hover:bg-ocean hover:text-white dark:text-nexus-200 dark:hover:bg-sky dark:hover:text-nexus-950"
                  )}
                  onClick={() => {
                    if (!item.disabled) commit(item.value);
                  }}
                >
                  <span className="whitespace-nowrap">{item.label}</span>
                  {isSelected ? <Check className="h-4 w-4 shrink-0" aria-hidden /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {hint && !error ? <p className="text-xs text-secondary">{hint}</p> : null}
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}

export function Checkbox({ label, className, id, ...props }) {
  const inputId = id || props.name;
  return (
    <label htmlFor={inputId} className={cn("flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300", className)}>
      <input
        id={inputId}
        type="checkbox"
        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-nexus-600 focus:ring-nexus-600"
        {...props}
      />
      <span>{label}</span>
    </label>
  );
}

export function Switch({ checked, onChange, label, id }) {
  return (
    <label htmlFor={id} className="inline-flex cursor-pointer items-center gap-3">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange?.(!checked)}
        className={cn(
          "relative h-6 w-11 rounded-full transition-colors",
          checked ? "bg-ocean" : "bg-nexus-700"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform",
            checked && "translate-x-5"
          )}
        />
      </button>
      {label ? <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span> : null}
    </label>
  );
}

export function RadioGroup({ label, name, options = [], value, onChange, className }) {
  return (
    <fieldset className={cn("space-y-2", className)}>
      {label ? <legend className="text-sm font-medium text-slate-800 dark:text-slate-200">{label}</legend> : null}
      <div className="space-y-2">
        {options.map((opt) => (
          <label key={opt.value} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange?.(opt.value)}
              className="h-4 w-4 text-nexus-600 focus:ring-nexus-600"
            />
            {opt.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
