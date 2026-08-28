import { cn } from "@/lib/cn";

const statusStyles = {
  draft: "bg-nexus-800 text-cream",
  submitted: "bg-ocean text-white",
  "under review": "bg-opportunity text-white",
  "university review": "bg-opportunity text-white",
  approved: "bg-success text-white",
  "university approved": "bg-success text-white",
  shortlisted: "bg-sky text-white",
  offered: "bg-ugc text-white",
  rejected: "bg-danger text-white",
  withdrawn: "bg-nexus-700 text-cream",
  disputed: "bg-[#c26a3a] text-white",
  completed: "bg-success text-white",
  expired: "bg-nexus-700 text-cream",
  pending: "bg-opportunity text-white",
  verified: "bg-success text-white",
  active: "bg-success text-white",
  published: "bg-ocean text-white",
  closed: "bg-nexus-800 text-cream",
  paused: "bg-opportunity text-white",
  "in progress": "bg-sky text-white",
  accepted: "bg-success text-white",
  "interview scheduled": "bg-ugc text-white",
  "changes requested": "bg-[#c26a3a] text-white",
  "sent to organization": "bg-ocean text-white",
  open: "bg-ocean text-white",
  resolved: "bg-success text-white",
  escalated: "bg-[#c26a3a] text-white",
};

export function Badge({ children, tone = "slate", className }) {
  const tones = {
    slate: "bg-[#f0eeea] text-nexus-800",
    teal: "bg-[#e8f0f7] text-nexus-700",
    blue: "bg-[#e7f3f7] text-nexus-600",
    violet: "bg-[#eceef5] text-ugc",
    amber: "bg-[#f7f1e6] text-opportunity-dark",
    green: "bg-[#e8f3ef] text-success",
    red: "bg-red-50 text-danger",
    cyan: "bg-[#e7f3f7] text-nexus-600",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide",
        tones[tone] || tones.slate,
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status, className }) {
  const key = String(status || "").toLowerCase();
  return (
    <span
      title={status}
      className={cn(
        "inline-flex h-6 max-w-full min-w-0 items-center gap-1.5 rounded-full px-2.5 text-[11px] font-semibold leading-none",
        statusStyles[key] || statusStyles.draft,
        className
      )}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" aria-hidden />
      <span className="truncate">{status}</span>
    </span>
  );
}

const DEFAULT_AVATAR = "/placeholders/avatar-default.svg";

export function Avatar({ name = "?", src, size = "md", className }) {
  const sizes = { sm: "h-9 w-9", md: "h-10 w-10", lg: "h-14 w-14" };
  const photo = src || DEFAULT_AVATAR;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photo}
      alt={name}
      onError={(e) => {
        if (e.currentTarget.getAttribute("data-fallback") === "1") return;
        e.currentTarget.setAttribute("data-fallback", "1");
        e.currentTarget.src = DEFAULT_AVATAR;
      }}
      className={cn(
        "shrink-0 rounded-full bg-sage object-cover ring-2 ring-white dark:ring-nexus-800",
        sizes[size],
        className
      )}
    />
  );
}

export function Progress({ value = 0, className, label }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("space-y-1", className)}>
      {label ? (
        <div className="flex justify-between text-xs text-secondary">
          <span>{label}</span>
          <span>{clamped}%</span>
        </div>
      ) : null}
      <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700" role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-nexus-600 transition-all" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}

export function Skeleton({ className }) {
  return <div className={cn("animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700", className)} />;
}

export function EmptyState({ title, description, action, icon, className }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#d5e3df] bg-cream px-6 py-14 text-center dark:border-nexus-700 dark:bg-nexus-900/40",
        className
      )}
    >
      {icon ? <div className="mb-4 text-slate-300 dark:text-slate-600">{icon}</div> : null}
      <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">{title}</h3>
      {description ? <p className="mt-1.5 max-w-md text-sm leading-relaxed text-secondary">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ title = "Something went wrong", description, action, className }) {
  return (
    <div className={cn("rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center dark:border-red-900 dark:bg-red-950/40", className)}>
      <h3 className="text-base font-semibold text-red-800 dark:text-red-200">{title}</h3>
      {description ? <p className="mt-1 text-sm text-red-700 dark:text-red-300">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function Pagination({ page, pageCount, onChange, className }) {
  if (pageCount <= 1) return null;
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="h-9 rounded-lg border border-slate-200 px-3 text-sm disabled:opacity-40 dark:border-slate-600"
      >
        Previous
      </button>
      <span className="text-sm text-secondary">
        Page {page} of {pageCount}
      </span>
      <button
        type="button"
        disabled={page >= pageCount}
        onClick={() => onChange(page + 1)}
        className="h-9 rounded-lg border border-slate-200 px-3 text-sm disabled:opacity-40 dark:border-slate-600"
      >
        Next
      </button>
    </div>
  );
}
