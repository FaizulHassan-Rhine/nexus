"use client";

import Link from "next/link";
import {
  Banknote,
  Bookmark,
  BookmarkCheck,
  Briefcase,
  CalendarDays,
  ExternalLink,
  GitCompare,
  LayoutGrid,
  List,
  MapPin,
  MoreHorizontal,
} from "lucide-react";
import { useSyncExternalStore } from "react";
import { Badge, StatusBadge, Button, Progress, DropdownMenu, IconButton } from "@/components/ui";
import { formatCurrency, formatDate, getMatchBand } from "@/lib/formatters";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser } from "@/hooks/useApp";
import { cn } from "@/lib/cn";
import { toast } from "sonner";

export function MatchScoreRing({ score, size = 64, className }) {
  const band = getMatchBand(score);
  const stroke = size >= 56 ? 5 : 4;
  const radius = (size - stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, Number(score) || 0));
  const offset = circumference - (clamped / 100) * circumference;
  const tone =
    clamped >= 75 ? "text-nexus-600" : clamped >= 60 ? "text-cyan-600" : clamped >= 40 ? "text-amber-600" : "text-slate-400";

  return (
    <div
      className={cn("relative inline-flex shrink-0 items-center justify-center", className)}
      style={{ width: size, height: size }}
      title={band.label}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
          fill="none"
          className="text-slate-100 dark:text-slate-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={tone}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[13px] font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          {Math.round(clamped)}
          <span className="text-[10px] font-medium text-slate-400">%</span>
        </span>
      </div>
      <span className="sr-only">
        {band.label}: {Math.round(clamped)} percent
      </span>
    </div>
  );
}

const MATCH_BREAKDOWN_LABELS = {
  skills: "Skills fit",
  qualifications: "Qualifications",
  preferences: "Preferences",
  affiliation: "Institutional affiliation",
  projectRequirements: "Project requirements",
  location: "Location fit",
  schedule: "Schedule fit",
  compensation: "Compensation fit",
  historicalPerformance: "Historical performance",
  availability: "Availability",
  funding: "Funding alignment",
};

export function MatchBreakdown({ scoreResult, className }) {
  if (!scoreResult) return null;
  const band = getMatchBand(scoreResult.total);
  const breakdown = scoreResult.breakdown || scoreResult.scoreBreakdown || {};
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-4">
        <MatchScoreRing score={scoreResult.total || scoreResult.overallScore || 0} />
        <div>
          <p className="font-semibold">{band.label}</p>
          <p className="text-xs text-secondary">Algorithm {scoreResult.algorithmVersion || "nexus-match-v1"}</p>
        </div>
      </div>
      <div className="space-y-2">
        {Object.entries(breakdown).map(([key, value]) => (
          <Progress key={key} label={MATCH_BREAKDOWN_LABELS[key] || key} value={Number(value)} />
        ))}
      </div>
      {scoreResult.reasons?.length ? (
        <div>
          <h4 className="text-sm font-medium">Why this matches</h4>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-secondary">
            {scoreResult.reasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {(scoreResult.gaps || scoreResult.missingRequirements)?.length ? (
        <div>
          <h4 className="text-sm font-medium">Gaps</h4>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-secondary">
            {(scoreResult.gaps || scoreResult.missingRequirements).map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function OpportunityViewToggle({ view, onViewChange, className }) {
  return (
    <div
      className={cn(
        "inline-flex shrink-0 rounded-lg border border-[#d5e3df] bg-white p-1 shadow-sm dark:border-nexus-700 dark:bg-nexus-900",
        className
      )}
      role="group"
      aria-label="View mode"
    >
      <button
        type="button"
        aria-pressed={view === "grid"}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold transition-colors",
          view === "grid" ? "bg-nexus-600 text-white shadow-sm" : "text-nexus-700 hover:bg-chrome dark:text-nexus-200"
        )}
        onClick={() => onViewChange("grid")}
      >
        <LayoutGrid className="h-4 w-4" />
        Grid
      </button>
      <button
        type="button"
        aria-pressed={view === "list"}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold transition-colors",
          view === "list" ? "bg-nexus-600 text-white shadow-sm" : "text-nexus-700 hover:bg-chrome dark:text-nexus-200"
        )}
        onClick={() => onViewChange("list")}
      >
        <List className="h-4 w-4" />
        List
      </button>
    </div>
  );
}

export function OpportunityCollection({
  children,
  view = "grid",
  onViewChange,
  count,
  countLabel = "results",
  className,
  headerClassName,
  showToolbar = true,
}) {
  return (
    <div className={className}>
      {showToolbar ? (
        <div
          className={cn(
            "mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#dfe8e4] bg-chrome px-4 py-3 dark:border-nexus-800 dark:bg-nexus-950/40",
            headerClassName
          )}
        >
          <p className="text-sm font-medium text-nexus-800 dark:text-nexus-100">
            {count != null ? `${count} ${countLabel}` : "Opportunities"}
          </p>
          {onViewChange ? <OpportunityViewToggle view={view} onViewChange={onViewChange} /> : null}
        </div>
      ) : null}
      <div
        className={
          view === "list"
            ? "flex flex-col gap-6"
            : "grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
        }
      >
        {children}
      </div>
    </div>
  );
}

export function OpportunityCard({
  opportunity,
  matchScore,
  view = "grid",
  actions = null,
  onMatchBreakdown = null,
  showUtilityActions = true,
}) {
  const user = useCurrentUser();
  const organizations = useAppStore((s) => s.organizations);
  const saved = useAppStore((s) => s.savedOpportunityIds || []);
  const compare = useAppStore((s) => s.compareOpportunityIds || []);
  const toggleSavedOpportunity = useAppStore((s) => s.toggleSavedOpportunity);
  const toggleCompareOpportunity = useAppStore((s) => s.toggleCompareOpportunity);
  const org = organizations.find((o) => o.id === opportunity.organizationId);
  const isSaved = saved.includes(opportunity.id);
  const inCompare = compare.includes(opportunity.id);
  const compensation = opportunity.compensation?.amount
    ? formatCurrency(opportunity.compensation.amount, opportunity.compensation.currency)
    : opportunity.compensation?.label || "See details";

  const accent = getOpportunityAccent(opportunity.type);
  const skills = (opportunity.requiredSkills || []).slice(0, view === "list" ? 4 : 3);
  const extraSkills = Math.max(0, (opportunity.requiredSkills || []).length - skills.length);

  const handleSave = () => {
    if (!user) {
      toast.message("Sign in to save opportunities");
      return;
    }
    toggleSavedOpportunity(opportunity.id);
    toast.success(isSaved ? "Removed from saved" : "Saved");
  };

  const handleCompare = () => {
    toggleCompareOpportunity(opportunity.id);
    toast.message(inCompare ? "Removed from compare" : "Added to compare (max 3)");
  };

  const menuItems = [
    {
      label: "View details",
      icon: <ExternalLink className="h-4 w-4" />,
      onClick: () => {
        window.location.href = `/opportunities/${opportunity.slug}`;
      },
    },
    {
      label: isSaved ? "Remove from saved" : "Save opportunity",
      icon: isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />,
      onClick: handleSave,
    },
    {
      label: inCompare ? "Remove from compare" : "Add to compare",
      icon: <GitCompare className="h-4 w-4" />,
      onClick: handleCompare,
    },
    ...(onMatchBreakdown
      ? [
          { divider: true },
          {
            label: "Match breakdown",
            onClick: onMatchBreakdown,
          },
        ]
      : []),
  ];

  return (
    <article className="relative z-0 flex flex-col overflow-hidden rounded-2xl border border-[#dfe8e4] bg-white shadow-[0_1px_2px_rgba(26,53,82,0.05)] transition-shadow duration-200 hover:z-10 hover:border-nexus-300 hover:shadow-[0_12px_32px_rgba(51,104,160,0.12)] dark:border-nexus-800 dark:bg-nexus-900">
      <div className={cn("pointer-events-none absolute inset-y-0 left-0 w-1.5", accent.bar)} aria-hidden />

      <div className={cn("min-w-0 flex-1 p-5 pl-7 sm:p-6 sm:pl-8", view === "list" && "sm:p-6 sm:pl-8")}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold", accent.chip)}>
                {opportunity.type}
              </span>
              {opportunity.ugcProgrammeId ? (
                <span className="text-[11px] font-medium text-ugc">UGC co-funded</span>
              ) : null}
              {opportunity.verificationStatus === "Verified" ? (
                <span className="text-[11px] font-medium text-success">Verified</span>
              ) : null}
            </div>
            <div>
              <Link
                href={`/opportunities/${opportunity.slug}`}
                className="line-clamp-2 text-lg leading-snug font-semibold tracking-tight text-nexus-900 transition-colors hover:text-nexus-600 dark:text-cream dark:hover:text-nexus-300"
              >
                {opportunity.title}
              </Link>
              <p className="mt-1.5 text-sm text-secondary">{org?.name || "Organization"}</p>
            </div>
          </div>

          <div className="relative z-20 flex shrink-0 items-start gap-2">
            {matchScore != null ? (
              <div className="flex flex-col items-center gap-1">
                <MatchScoreRing score={matchScore} size={view === "list" ? 52 : 56} />
                <span className="text-[10px] font-medium tracking-wide text-secondary uppercase">Match</span>
              </div>
            ) : null}
            <DropdownMenu
              align="right"
              trigger={
                <IconButton label="More options" className="h-8 w-8 rounded-lg border border-[#e6e2dc] bg-chrome/80 dark:border-nexus-700 dark:bg-nexus-950/60">
                  <MoreHorizontal className="h-4 w-4" />
                </IconButton>
              }
              items={menuItems}
            />
          </div>
        </div>

        <dl
          className={cn(
            "mt-5 grid gap-3 text-sm",
            view === "list" ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2"
          )}
        >
          <MetaItem icon={MapPin} iconClass={accent.icon} label="Location" value={opportunity.location || opportunity.division || "—"} />
          <MetaItem icon={Briefcase} iconClass={accent.icon} label="Work mode" value={opportunity.workMode || "—"} />
          <MetaItem icon={Banknote} iconClass={accent.icon} label="Compensation" value={compensation} />
          <MetaItem icon={CalendarDays} iconClass={accent.icon} label="Deadline" value={formatDate(opportunity.deadline)} />
        </dl>

        {skills.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-[#e0ddd6] bg-chrome/60 px-2.5 py-1 text-xs text-nexus-700 dark:border-nexus-700 dark:bg-nexus-950/40 dark:text-nexus-200"
              >
                {skill}
              </span>
            ))}
            {extraSkills > 0 ? (
              <span className="rounded-full bg-chrome px-2.5 py-1 text-xs text-secondary dark:bg-nexus-800">
                +{extraSkills} more
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      {(actions || showUtilityActions) ? (
        <div className="shrink-0 border-t border-[#e8e4de] bg-chrome px-5 py-4 pl-7 dark:border-nexus-800 dark:bg-nexus-950/60">
          <div className="flex flex-wrap items-center gap-2">
            {actions}
            {showUtilityActions ? (
              <>
                <Button size="sm" variant="outline" onClick={handleSave}>
                  {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                  {isSaved ? "Saved" : "Save"}
                </Button>
                <Button size="sm" variant={inCompare ? "primary" : "secondary"} onClick={handleCompare}>
                  <GitCompare className="h-4 w-4" />
                  Compare
                </Button>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </article>
  );
}

function MetaItem({ icon: Icon, iconClass, label, value }) {
  return (
    <div className="flex items-start gap-2 text-nexus-800 dark:text-nexus-100">
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", iconClass)} aria-hidden />
      <div className="min-w-0">
        <dt className="text-[11px] font-medium tracking-wide text-secondary uppercase">{label}</dt>
        <dd className="mt-0.5 truncate font-medium">{value}</dd>
      </div>
    </div>
  );
}

function getOpportunityAccent(type) {
  const map = {
    "Paid internship": {
      bar: "bg-nexus-600",
      chip: "bg-[#e8f0f7] text-nexus-700",
      icon: "text-nexus-600",
    },
    "Micro-internship": {
      bar: "bg-nexus-400",
      chip: "bg-[#e7f3f7] text-nexus-600",
      icon: "text-nexus-400",
    },
    "Full-time job": {
      bar: "bg-success",
      chip: "bg-[#e8f3ef] text-success",
      icon: "text-success",
    },
    "Part-time job": {
      bar: "bg-success",
      chip: "bg-[#e8f3ef] text-success",
      icon: "text-success",
    },
    Scholarship: {
      bar: "bg-opportunity",
      chip: "bg-[#f7f1e6] text-opportunity-dark",
      icon: "text-opportunity",
    },
    "Student project funding": {
      bar: "bg-opportunity",
      chip: "bg-[#f7f1e6] text-opportunity-dark",
      icon: "text-opportunity",
    },
    "Research grant": {
      bar: "bg-ugc",
      chip: "bg-[#eceef5] text-ugc",
      icon: "text-ugc",
    },
    "Joint research": {
      bar: "bg-ugc",
      chip: "bg-[#eceef5] text-ugc",
      icon: "text-ugc",
    },
    "Free course": {
      bar: "bg-nexus-400",
      chip: "bg-[#e7f3f7] text-nexus-600",
      icon: "text-nexus-400",
    },
    "Paid course": {
      bar: "bg-nexus-500",
      chip: "bg-[#e8f0f7] text-nexus-700",
      icon: "text-nexus-500",
    },
    Bootcamp: {
      bar: "bg-nexus-500",
      chip: "bg-[#e8f0f7] text-nexus-700",
      icon: "text-nexus-500",
    },
    Mentorship: {
      bar: "bg-nexus-400",
      chip: "bg-[#e7f3f7] text-nexus-600",
      icon: "text-nexus-400",
    },
    "Competition/hackathon": {
      bar: "bg-[#c26a3a]",
      chip: "bg-[#f8ebe4] text-[#9a4f2a]",
      icon: "text-[#c26a3a]",
    },
    "Technology licensing": {
      bar: "bg-ugc",
      chip: "bg-[#eceef5] text-ugc",
      icon: "text-ugc",
    },
  };
  return (
    map[type] || {
      bar: "bg-nexus-600",
      chip: "bg-[#e8f0f7] text-nexus-700",
      icon: "text-nexus-600",
    }
  );
}

export function ApplicationTimeline({ events = [] }) {
  return (
    <ol className="space-y-4 border-l border-slate-200 pl-4 dark:border-slate-700">
      {events.map((event, idx) => (
        <li key={`${event.at}-${idx}`} className="relative">
          <span className="absolute top-1 -left-[21px] h-2.5 w-2.5 rounded-full bg-nexus-600" />
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={event.status} />
            <span className="text-xs text-secondary">{formatDate(event.at, "dd MMM yyyy HH:mm")}</span>
          </div>
          {event.note ? <p className="mt-1 text-sm text-secondary">{event.note}</p> : null}
        </li>
      ))}
    </ol>
  );
}

export function FundingSplitCard({ companyShare, ugcShare, total }) {
  return (
    <div className="card-surface p-4">
      <h3 className="text-sm font-semibold">Funding split</h3>
      <p className="mt-1 text-xs text-secondary">Company + UGC must equal 100%</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-blue-50 p-3 dark:bg-blue-950/40">
          <p className="text-xs text-secondary">Company</p>
          <p className="text-lg font-semibold">{companyShare}%</p>
          {total ? <p className="text-xs">{formatCurrency((total * companyShare) / 100)}</p> : null}
        </div>
        <div className="rounded-xl bg-violet-50 p-3 dark:bg-violet-950/40">
          <p className="text-xs text-secondary">UGC</p>
          <p className="text-lg font-semibold">{ugcShare}%</p>
          {total ? <p className="text-xs">{formatCurrency((total * ugcShare) / 100)}</p> : null}
        </div>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div className="flex h-full">
          <div className="bg-institutional" style={{ width: `${companyShare}%` }} />
          <div className="bg-ugc" style={{ width: `${ugcShare}%` }} />
        </div>
      </div>
    </div>
  );
}

export function PaymentMilestones({ milestones = [] }) {
  return (
    <div className="space-y-2">
      {milestones.map((m, idx) => (
        <div key={m.id || idx} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700">
          <div>
            <p className="font-medium">{m.label || `Milestone ${idx + 1}`}</p>
            <p className="text-xs text-secondary">{formatDate(m.dueDate)}</p>
          </div>
          <div className="text-right">
            <p className="font-medium">{formatCurrency(m.amount)}</p>
            <StatusBadge status={m.status || "Pending"} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProfileCompletionCard({ value = 0, href = "#" }) {
  return (
    <div className="card-surface p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Profile completion</h3>
        <Link href={href} className="text-sm text-nexus-700">
          Improve
        </Link>
      </div>
      <Progress className="mt-3" value={value} label="Opportunity Passport readiness" />
    </div>
  );
}

let clockSnapshot = 0;
let clockInterval = null;
const clockSubscribers = new Set();

function subscribeClock(onStoreChange) {
  clockSubscribers.add(onStoreChange);
  if (!clockSnapshot) clockSnapshot = Date.now();
  if (!clockInterval) {
    clockInterval = setInterval(() => {
      clockSnapshot = Date.now();
      clockSubscribers.forEach((cb) => cb());
    }, 60_000);
  }
  return () => {
    clockSubscribers.delete(onStoreChange);
    if (clockSubscribers.size === 0 && clockInterval) {
      clearInterval(clockInterval);
      clockInterval = null;
    }
  };
}

function getClockSnapshot() {
  if (!clockSnapshot) clockSnapshot = Date.now();
  return clockSnapshot;
}

function getClockServerSnapshot() {
  return 0;
}

export function SlaBadge({ deadline }) {
  const nowMs = useSyncExternalStore(subscribeClock, getClockSnapshot, getClockServerSnapshot);
  if (!deadline) return null;
  if (!nowMs) return <Badge tone="amber">SLA pending</Badge>;
  const remaining = new Date(deadline).getTime() - nowMs;
  const hours = remaining / 3600000;
  const breached = hours < 0;
  return (
    <Badge tone={breached ? "red" : hours < 4 ? "amber" : "green"}>
      {breached ? "SLA breached" : `${Math.ceil(hours)}h left`}
    </Badge>
  );
}

export function AuditEventList({ events = [] }) {
  return (
    <ul className="space-y-3">
      {events.map((e) => (
        <li key={e.id} className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-medium">{e.action}</span>
            <span className="text-xs text-secondary">{formatDate(e.timestamp || e.at, "dd MMM yyyy HH:mm")}</span>
          </div>
          <p className="mt-1 text-secondary">{e.details}</p>
          <p className="mt-1 text-xs text-secondary">
            {e.entityType} · {e.entityId}
          </p>
        </li>
      ))}
    </ul>
  );
}
