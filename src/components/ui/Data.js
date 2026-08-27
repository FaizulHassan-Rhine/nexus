"use client";

import { cn } from "@/lib/cn";

export function DataTable({ columns = [], rows = [], emptyMessage = "No records found", className }) {
  if (!rows.length) {
    return <p className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-secondary">{emptyMessage}</p>;
  }

  return (
    <div className={cn("overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700", className)}>
      <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
        <thead className="bg-cream dark:bg-nexus-800/80">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#d5e3df] bg-cream dark:divide-nexus-700 dark:bg-nexus-900">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-nexus-100/50 dark:hover:bg-nexus-800/60">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 whitespace-nowrap text-slate-700 dark:text-slate-200">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function FilterBar({ children, className }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-end gap-3 rounded-2xl border border-[#d5e3df]/80 bg-cream p-4 shadow-[0_1px_2px_rgba(51,104,160,0.05)] dark:border-nexus-700/80 dark:bg-nexus-900",
        className
      )}
    >
      {children}
    </div>
  );
}

export function StatCard({ label, value, hint, icon, tone = "teal", className }) {
  const tones = {
    teal: "bg-ocean text-white",
    blue: "bg-sky text-white",
    violet: "bg-ugc text-white",
    amber: "bg-opportunity text-white",
    green: "bg-success text-white",
    red: "bg-danger text-white",
  };
  return (
    <div className={cn("card-surface p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-[0.08em] text-slate-500 uppercase">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">{value}</p>
          {hint ? <p className="mt-1.5 text-xs leading-relaxed text-secondary">{hint}</p> : null}
        </div>
        {icon ? <div className={cn("rounded-xl p-2.5", tones[tone])}>{icon}</div> : null}
      </div>
    </div>
  );
}

export function ChartCard({ title, summary, children, className }) {
  return (
    <div className={cn("card-surface p-5", className)}>
      <div className="mb-5">
        <h3 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-50">{title}</h3>
        {summary ? <p className="mt-1 text-xs leading-relaxed text-secondary">{summary}</p> : null}
      </div>
      {children}
    </div>
  );
}

export function PageHeader({ title, description, actions, breadcrumbs }) {
  return (
    <div className="mb-6 space-y-3">
      {breadcrumbs}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">{title}</h1>
          {description ? <p className="mt-1 max-w-3xl text-sm text-secondary">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}

export function SectionHeader({ title, description, actions, className }) {
  return (
    <div className={cn("mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{title}</h2>
        {description ? <p className="text-sm text-secondary">{description}</p> : null}
      </div>
      {actions}
    </div>
  );
}
