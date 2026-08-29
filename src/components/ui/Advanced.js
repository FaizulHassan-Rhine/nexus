"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/cn";

export { DateInput } from "./DatePicker";

export function DropdownMenu({ trigger, items = [], align = "right", className }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
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
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen((v) => !v)}>{trigger}</div>
      {open ? (
        <div
          role="menu"
          className={cn(
            "absolute z-50 mt-2 min-w-48 overflow-hidden rounded-xl border border-[#d5e3df] bg-cream py-1 shadow-lg dark:border-nexus-700 dark:bg-nexus-900",
            align === "right" ? "right-0" : "left-0",
            className
          )}
        >
          {items.map((item, idx) =>
            item.divider ? (
              <div key={`d-${idx}`} className="my-1 border-t border-slate-200 dark:border-slate-700" />
            ) : item.header ? (
              <div key={`h-${idx}`} className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                {item.content}
              </div>
            ) : (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium hover:bg-ocean hover:text-white dark:hover:bg-sky dark:hover:text-nexus-950",
                  item.danger && "text-danger",
                  item.disabled && "opacity-40"
                )}
                onClick={() => {
                  item.onClick?.();
                  setOpen(false);
                }}
              >
                {item.icon}
                {item.label}
              </button>
            )
          )}
        </div>
      ) : null}
    </div>
  );
}

export function Combobox({ options = [], value, onChange, placeholder = "Search...", label, className }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const filtered = options.filter((o) =>
    String(o.label ?? o).toLowerCase().includes(query.toLowerCase())
  );
  const selected = options.find((o) => (o.value ?? o) === value);

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

  return (
    <div className={cn("relative space-y-1.5", className)} ref={ref}>
      {label ? <label className="block text-sm font-medium">{label}</label> : null}
      <div className="relative">
        <Search className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
        <input
          value={open ? query : selected?.label ?? selected ?? ""}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setQuery("");
            setOpen(true);
          }}
          placeholder={placeholder}
          className="h-10 w-full rounded-lg border border-[#d5e3df] bg-cream pr-8 pl-9 text-sm dark:border-nexus-700 dark:bg-nexus-900"
        />
        <ChevronDown className="pointer-events-none absolute top-2.5 right-3 h-4 w-4 text-slate-400" />
      </div>
      {open ? (
        <div className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-[#d5e3df] bg-cream shadow-lg dark:border-nexus-700 dark:bg-nexus-900">
          {filtered.length === 0 ? (
            <p className="px-3 py-2 text-sm text-secondary">No matches</p>
          ) : (
            filtered.map((opt) => (
              <button
                key={opt.value ?? opt}
                type="button"
                className="block w-full px-3 py-2 text-left text-sm font-medium hover:bg-ocean hover:text-white dark:hover:bg-sky dark:hover:text-nexus-950"
                onClick={() => {
                  onChange?.(opt.value ?? opt);
                  setOpen(false);
                }}
              >
                {opt.label ?? opt}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}

export function Tooltip({ content, children }) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 rounded-md bg-slate-900 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100 dark:bg-slate-700">
        {content}
      </span>
    </span>
  );
}

export function FileUploader({ label, accept, onChange, value, onRemove, className }) {
  const [progress, setProgress] = useState(0);

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProgress(20);
    await new Promise((r) => setTimeout(r, 200));
    setProgress(70);
    await new Promise((r) => setTimeout(r, 200));
    setProgress(100);
    onChange?.({
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
    });
    setTimeout(() => setProgress(0), 400);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label ? <p className="text-sm font-medium">{label}</p> : null}
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#d5e3df] bg-cream px-4 py-6 text-center hover:border-nexus-400 dark:border-nexus-700 dark:bg-nexus-900 dark:hover:border-nexus-500">
        <span className="text-sm font-medium text-nexus-700 dark:text-nexus-300">Choose file</span>
        <span className="mt-1 text-xs text-secondary">Metadata only — binary not stored</span>
        <input type="file" accept={accept} className="sr-only" onChange={handleChange} />
      </label>
      {progress > 0 ? (
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full bg-nexus-600 transition-all" style={{ width: `${progress}%` }} />
        </div>
      ) : null}
      {value ? (
        <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700">
          <span>
            {value.name} <span className="text-secondary">({Math.round((value.size || 0) / 1024)} KB)</span>
          </span>
          <button type="button" className="text-danger" onClick={onRemove}>
            Remove
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function MultiStepForm({ steps = [], current = 0, onStepChange, children }) {
  return (
    <div className="space-y-6">
      <ol className="flex flex-wrap gap-2">
        {steps.map((step, idx) => (
          <li key={step}>
            <button
              type="button"
              onClick={() => onStepChange?.(idx)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium",
                idx === current
                  ? "bg-nexus-600 text-white"
                  : idx < current
                    ? "bg-nexus-100 text-nexus-800 dark:bg-nexus-950 dark:text-nexus-200"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800"
              )}
            >
              {idx + 1}. {step}
            </button>
          </li>
        ))}
      </ol>
      <div>{children}</div>
    </div>
  );
}

export function Slider({ label, value, onChange, min = 0, max = 100, step = 1 }) {
  return (
    <div className="space-y-2">
      {label ? (
        <div className="flex justify-between text-sm">
          <span>{label}</span>
          <span className="font-medium">{value}</span>
        </div>
      ) : null}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange?.(Number(e.target.value))}
        className="w-full accent-nexus-600"
      />
    </div>
  );
}
