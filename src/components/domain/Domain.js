"use client";

import Link from "next/link";
import { Banknote, Bookmark, BookmarkCheck, Briefcase, CalendarDays, GitCompare, MapPin } from "lucide-react";
import { useSyncExternalStore } from "react";
import { Badge, StatusBadge, Button, Progress } from "@/components/ui";
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

export function OpportunityCard({ opportunity, matchScore, view = "grid" }) {
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
  const skills = (opportunity.requiredSkills || []).slice(0, 3);
  const extraSkills = Math.max(0, (opportunity.requiredSkills || []).length - 3);

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-[#e6e2dc] bg-white shadow-[0_1px_2px_rgba(26,53,82,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-nexus-300 hover:shadow-[0_10px_28px_rgba(51,104,160,0.10)] dark:border-nexus-800 dark:bg-nexus-900",
        view === "list" && "sm:flex-row sm:items-stretch"
      )}
    >
      <div className={cn("absolute inset-y-0 left-0 w-1", accent.bar)} aria-hidden />

      <Link
        href={`/opportunities/${opportunity.slug}`}
        className={cn("min-w-0 flex-1 space-y-5 p-6 pl-7", view === "list" && "sm:p-7 sm:pl-8")}
      >
        <div className="flex items-start justify-between gap-4">
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
              <h3 className="line-clamp-2 text-lg leading-snug font-semibold tracking-tight text-nexus-900 transition-colors group-hover:text-nexus-600 dark:text-cream dark:group-hover:text-nexus-300">
                {opportunity.title}
              </h3>
              <p className="mt-1.5 text-sm text-secondary">{org?.name || "Organization"}</p>
            </div>
          </div>
          {matchScore != null ? (
            <div className="flex flex-col items-center gap-1">
              <MatchScoreRing score={matchScore} size={56} />
              <span className="text-[10px] font-medium tracking-wide text-secondary uppercase">Match</span>
            </div>
          ) : null}
        </div>

        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="flex items-start gap-2 text-nexus-800 dark:text-nexus-100">
            <MapPin className={cn("mt-0.5 h-4 w-4 shrink-0", accent.icon)} aria-hidden />
            <div>
              <dt className="text-[11px] font-medium tracking-wide text-secondary uppercase">Location</dt>
              <dd className="mt-0.5 font-medium">{opportunity.location || opportunity.division || "—"}</dd>
            </div>
          </div>
          <div className="flex items-start gap-2 text-nexus-800 dark:text-nexus-100">
            <Briefcase className={cn("mt-0.5 h-4 w-4 shrink-0", accent.icon)} aria-hidden />
            <div>
              <dt className="text-[11px] font-medium tracking-wide text-secondary uppercase">Work mode</dt>
              <dd className="mt-0.5 font-medium">{opportunity.workMode || "—"}</dd>
            </div>
          </div>
          <div className="flex items-start gap-2 text-nexus-800 dark:text-nexus-100">
            <Banknote className={cn("mt-0.5 h-4 w-4 shrink-0", accent.icon)} aria-hidden />
            <div>
              <dt className="text-[11px] font-medium tracking-wide text-secondary uppercase">Compensation</dt>
              <dd className="mt-0.5 font-medium">{compensation}</dd>
            </div>
          </div>
          <div className="flex items-start gap-2 text-nexus-800 dark:text-nexus-100">
            <CalendarDays className={cn("mt-0.5 h-4 w-4 shrink-0", accent.icon)} aria-hidden />
            <div>
              <dt className="text-[11px] font-medium tracking-wide text-secondary uppercase">Deadline</dt>
              <dd className="mt-0.5 font-medium">{formatDate(opportunity.deadline)}</dd>
            </div>
          </div>
        </dl>

        {skills.length ? (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-[#e0ddd6] px-2.5 py-1 text-xs text-nexus-700 dark:border-nexus-700 dark:text-nexus-200"
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
      </Link>

      <div
        className={cn(
          "flex items-center gap-2 border-t border-[#eeeae4] bg-[#fcfbf9] px-6 py-3.5 pl-7 dark:border-nexus-800 dark:bg-nexus-950/50",
          view === "list" && "sm:w-44 sm:flex-col sm:justify-center sm:gap-2 sm:border-t-0 sm:border-l sm:px-4 sm:pl-4"
        )}
      >
        <Button
          size="sm"
          variant="outline"
          className="flex-1 sm:flex-none"
          onClick={() => {
            if (!user) {
              toast.message("Sign in to save opportunities");
              return;
            }
            toggleSavedOpportunity(opportunity.id);
            toast.success(isSaved ? "Removed from saved" : "Saved");
          }}
        >
          {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          {isSaved ? "Saved" : "Save"}
        </Button>
        <Button
          size="sm"
          variant={inCompare ? "primary" : "secondary"}
          className="flex-1 sm:flex-none"
          onClick={() => {
            toggleCompareOpportunity(opportunity.id);
            toast.message(inCompare ? "Removed from compare" : "Added to compare (max 3)");
          }}
        >
          <GitCompare className="h-4 w-4" />
          Compare
        </Button>
      </div>
    </article>
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
