"use client";

import { createContext, useContext, useState } from "react";
import { cn } from "@/lib/cn";

const TabsContext = createContext(null);

export function Tabs({ defaultValue, value: controlled, onChange, children, className }) {
  const [internal, setInternal] = useState(defaultValue);
  const value = controlled ?? internal;
  const setValue = onChange ?? setInternal;
  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabList({ children, className }) {
  return (
    <div role="tablist" className={cn("flex flex-wrap gap-1 border-b border-slate-200 dark:border-slate-700", className)}>
      {children}
    </div>
  );
}

export function Tab({ value, children, className }) {
  const ctx = useContext(TabsContext);
  const selected = ctx.value === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={() => ctx.setValue(value)}
      className={cn(
        "-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors",
        selected
          ? "border-nexus-600 text-nexus-700 dark:text-nexus-300"
          : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200",
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabPanel({ value, children, className }) {
  const ctx = useContext(TabsContext);
  if (ctx.value !== value) return null;
  return (
    <div role="tabpanel" className={cn("pt-4", className)}>
      {children}
    </div>
  );
}

export function Accordion({ items = [], className }) {
  const [open, setOpen] = useState(items[0]?.id ?? null);
  return (
    <div className={cn("space-y-2", className)}>
      {items.map((item) => {
        const isOpen = open === item.id;
        return (
          <div key={item.id} className="rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : item.id)}
            >
              {item.title}
              <span className="text-slate-400">{isOpen ? "−" : "+"}</span>
            </button>
            {isOpen ? <div className="border-t border-slate-200 px-4 py-3 text-sm text-secondary dark:border-slate-700">{item.content}</div> : null}
          </div>
        );
      })}
    </div>
  );
}
