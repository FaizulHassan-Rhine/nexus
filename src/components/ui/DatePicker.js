"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function MiniSelect({ value, options, onChange, ariaLabel, className }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = options.find((o) => o.value === value) || options[0];

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div className={cn("relative", className)} ref={ref}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-full items-center justify-between gap-1 rounded-md border border-[#d5e3df] bg-cream px-1.5 text-sm font-medium dark:border-nexus-700 dark:bg-nexus-900"
      >
        <span className="truncate">{selected?.label}</span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
      </button>
      {open ? (
        <ul className="absolute z-[60] mt-1 max-h-48 w-full overflow-auto rounded-lg border border-[#d5e3df] bg-cream py-1 shadow-lg dark:border-nexus-700 dark:bg-nexus-900">
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <li key={opt.value}>
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center justify-between px-2 py-1.5 text-left text-sm",
                    active ? "bg-ocean text-white" : "hover:bg-ocean hover:text-white dark:hover:bg-sky dark:hover:text-nexus-950"
                  )}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                >
                  <span className="truncate">{opt.label}</span>
                  {active ? <Check className="h-3.5 w-3.5" /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function parseIsoDate(value) {
  if (!value || typeof value !== "string") return null;
  const match = value.slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

function toIsoDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDisplayDate(value) {
  const date = parseIsoDate(value);
  if (!date) return "";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function sameDay(a, b) {
  return (
    a &&
    b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildMonthGrid(year, month) {
  const first = new Date(year, month, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startPad; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(new Date(year, month, day));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function DateInput({
  label,
  value = "",
  onChange,
  name,
  id,
  required,
  error,
  hint,
  className,
  placeholder = "Select date",
  min,
  max,
  disabled = false,
}) {
  const inputId = id || name;
  const selected = parseIsoDate(value);
  const minDate = parseIsoDate(min);
  const maxDate = parseIsoDate(max);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => {
    const base = selected || new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const [today] = useState(() => new Date());
  const [yearOptions] = useState(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);
  });
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const emit = (nextValue) => {
    onChange?.({
      target: { name, value: nextValue },
      currentTarget: { name, value: nextValue },
    });
  };

  const isDisabledDay = (date) => {
    if (!date) return true;
    if (minDate) {
      const floor = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
      if (date < floor) return true;
    }
    if (maxDate) {
      const ceil = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate());
      if (date > ceil) return true;
    }
    return false;
  };

  const cells = buildMonthGrid(view.getFullYear(), view.getMonth());

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
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          if (disabled) return;
          const base = selected || new Date();
          setView(new Date(base.getFullYear(), base.getMonth(), 1));
          setOpen((v) => !v);
        }}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-[#d5e3df] bg-cream px-3 text-left text-sm text-nexus-900 focus:border-nexus-600 focus:outline-none focus:ring-2 focus:ring-nexus-600/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-nexus-700 dark:bg-nexus-900 dark:text-cream",
          error && "border-danger focus:border-danger focus:ring-danger/20"
        )}
      >
        <span className={cn("truncate", !selected && "text-slate-400")}>
          {selected ? formatDisplayDate(value) : placeholder}
        </span>
        <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label={label || "Choose date"}
          className="absolute z-50 mt-2 w-[288px] rounded-xl border border-[#d5e3df] bg-cream p-3 shadow-xl dark:border-nexus-700 dark:bg-nexus-900"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              aria-label="Previous month"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ocean hover:bg-ocean hover:text-white dark:text-sky dark:hover:bg-sky dark:hover:text-nexus-950"
              onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex min-w-0 items-center gap-1">
              <MiniSelect
                ariaLabel="Month"
                value={String(view.getMonth())}
                options={MONTHS.map((month, idx) => ({ value: String(idx), label: month }))}
                onChange={(next) => setView(new Date(view.getFullYear(), Number(next), 1))}
                className="max-w-[8.5rem]"
              />
              <MiniSelect
                ariaLabel="Year"
                value={String(view.getFullYear())}
                options={yearOptions.map((year) => ({ value: String(year), label: String(year) }))}
                onChange={(next) => setView(new Date(Number(next), view.getMonth(), 1))}
                className="w-[5.5rem]"
              />
            </div>
            <button
              type="button"
              aria-label="Next month"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ocean hover:bg-ocean hover:text-white dark:text-sky dark:hover:bg-sky dark:hover:text-nexus-950"
              onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-1">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="py-1 text-center text-[11px] font-semibold tracking-wide text-slate-400 uppercase"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((date, idx) => {
              if (!date) return <div key={`empty-${idx}`} className="h-9" />;
              const disabledDay = isDisabledDay(date);
              const isSelected = sameDay(date, selected);
              const isToday = sameDay(date, today);
              return (
                <button
                  key={toIsoDate(date)}
                  type="button"
                  disabled={disabledDay}
                  onClick={() => {
                    emit(toIsoDate(date));
                    setOpen(false);
                  }}
                  className={cn(
                    "inline-flex h-9 items-center justify-center rounded-lg text-sm transition-colors",
                    disabledDay && "cursor-not-allowed text-slate-300 dark:text-slate-600",
                    !disabledDay &&
                      !isSelected &&
                      "text-nexus-800 hover:bg-ocean hover:text-white dark:text-nexus-200 dark:hover:bg-sky dark:hover:text-nexus-950",
                    isToday && !isSelected && "ring-1 ring-ocean dark:ring-sky",
                    isSelected && "bg-ocean font-semibold text-white hover:bg-nexus-800"
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-200 pt-3 dark:border-slate-700">
            <button
              type="button"
              className="rounded-lg px-2 py-1.5 text-xs font-semibold text-ocean hover:bg-ocean hover:text-white dark:hover:bg-sky dark:hover:text-nexus-950"
              onClick={() => {
                emit("");
                setOpen(false);
              }}
            >
              Clear
            </button>
            <button
              type="button"
              className="rounded-lg px-2 py-1.5 text-xs font-semibold text-white bg-ocean hover:bg-nexus-800 dark:bg-sky dark:text-nexus-950 dark:hover:bg-ocean dark:hover:text-white"
              onClick={() => {
                const now = today;
                if (!isDisabledDay(now)) {
                  emit(toIsoDate(now));
                  setOpen(false);
                }
              }}
            >
              Today
            </button>
          </div>
        </div>
      ) : null}

      {hint && !error ? <p className="text-xs text-secondary">{hint}</p> : null}
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
