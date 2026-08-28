"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { PageHeader, SectionHeader } from "@/components/ui";
import { Button, DropdownMenu, StatusBadge, Avatar } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { applicationService } from "@/lib/mockServices";
import { formatDate } from "@/lib/formatters";
import { toast } from "sonner";
import { PIPELINE_COLUMNS, getOrgApplications } from "../_lib/helpers";

const NEXT_STATUS = {
  new: ["University review", "Shortlisted", "Rejected"],
  university: ["University approved", "Changes requested", "Rejected"],
  approved: ["Shortlisted", "Sent to organization"],
  shortlisted: ["Interview scheduled", "Rejected"],
  interview: ["Offered", "Rejected"],
  offer: ["Accepted", "Rejected"],
  hired: ["Completed"],
  rejected: [],
};

export default function PipelinePage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const applications = useAppStore((s) => s.applications);
  const opportunities = useAppStore((s) => s.opportunities);
  const users = useAppStore((s) => s.users);
  const [focusedCard, setFocusedCard] = useState(null);

  const orgApps = useMemo(
    () => getOrgApplications(applications, opportunities, user?.organizationId),
    [applications, opportunities, user]
  );

  const columns = useMemo(() => {
    return PIPELINE_COLUMNS.map((col) => ({
      ...col,
      items: orgApps.filter((a) => col.statuses.includes(a.status)),
    }));
  }, [orgApps]);

  const moveApplication = async (appId, status) => {
    await applicationService.updateStatus(appId, status, `Pipeline move by ${user?.name}`, user?.role);
    toast.success(`Moved to ${status}`);
  };

  const handleKeyMove = (e, app, colId) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const options = NEXT_STATUS[colId] || [];
      if (options[0]) moveApplication(app.id, options[0]);
    }
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recruitment pipeline"
        description={`${orgApps.length} applications · Use action menus or keyboard (Enter) on focused cards`}
        actions={
          <Button variant="secondary" onClick={() => toast.message("Drag-and-drop optional — all moves available via menu")}>
            Help
          </Button>
        }
      />

      <div className="flex gap-4 overflow-x-auto pb-2">
        {columns.map((col) => (
          <section
            key={col.id}
            className="flex min-w-[280px] flex-1 flex-col rounded-2xl border border-[#dfe8e4] bg-chrome dark:border-nexus-800 dark:bg-nexus-950/40"
            aria-label={`${col.label} column`}
          >
            <header className="flex items-center justify-between gap-2 border-b border-[#dfe8e4] px-4 py-3 dark:border-nexus-800">
              <h2 className="text-sm font-semibold text-nexus-900 dark:text-cream">{col.label}</h2>
              <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-2 text-xs font-semibold text-nexus-700 dark:bg-nexus-900 dark:text-nexus-200">
                {col.items.length}
              </span>
            </header>
            <ul className="flex flex-1 flex-col gap-3 p-3" role="list">
              {col.items.map((app) => {
                const candidate = users.find((u) => u.id === app.applicantId);
                const opp = opportunities.find((o) => o.id === app.opportunityId);
                const nextOptions = NEXT_STATUS[col.id] || [];
                return (
                  <li key={app.id}>
                    <article
                      tabIndex={0}
                      aria-label={`${candidate?.name || "Candidate"} — ${app.status}. Press Enter to advance.`}
                      className={`flex flex-col overflow-hidden rounded-xl border border-[#dfe8e4] bg-white shadow-[0_1px_2px_rgba(26,53,82,0.05)] outline-none transition-shadow focus:ring-2 focus:ring-nexus-500 dark:border-nexus-800 dark:bg-nexus-900 ${
                        focusedCard === app.id ? "ring-2 ring-nexus-400" : ""
                      }`}
                      onFocus={() => setFocusedCard(app.id)}
                      onKeyDown={(e) => handleKeyMove(e, app, col.id)}
                    >
                      <div className="flex items-start gap-3 p-3">
                        <Avatar name={candidate?.name} src={candidate?.avatar} size="sm" />
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/organization/candidates/${app.applicantId}`}
                            className="block truncate text-sm font-semibold text-nexus-900 hover:text-nexus-600 dark:text-cream"
                          >
                            {candidate?.name || app.applicantId}
                          </Link>
                          <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-secondary">{opp?.title}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-3 pb-3">
                        <StatusBadge status={app.status} className="max-w-[70%]" />
                        <span className="ml-auto shrink-0 text-[11px] text-secondary">
                          {formatDate(app.updatedAt || app.submittedAt)}
                        </span>
                      </div>
                      {nextOptions.length ? (
                        <div className="border-t border-[#eeeae4] bg-chrome/80 px-3 py-2 dark:border-nexus-800 dark:bg-nexus-950/50">
                          <DropdownMenu
                            trigger={
                              <button
                                type="button"
                                className="inline-flex h-8 w-full items-center justify-center gap-1 rounded-lg border border-[#d5e3df] bg-white text-xs font-semibold text-nexus-800 hover:border-nexus-400 hover:bg-chrome dark:border-nexus-700 dark:bg-nexus-900 dark:text-nexus-100"
                                aria-haspopup="menu"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Move to
                                <ChevronDown className="h-3.5 w-3.5" />
                              </button>
                            }
                            items={nextOptions.map((status) => ({
                              label: status,
                              onClick: () => moveApplication(app.id, status),
                            }))}
                          />
                        </div>
                      ) : null}
                    </article>
                  </li>
                );
              })}
              {!col.items.length && (
                <li className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-[#d5e3df] px-3 py-10 text-center text-xs text-secondary dark:border-nexus-800">
                  No candidates
                </li>
              )}
            </ul>
          </section>
        ))}
      </div>

      <SectionHeader title="Pipeline summary" description="Distribution across stages" />
      <div className="grid gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {columns.map((col) => (
          <div key={col.id} className="rounded-xl border border-[#dfe8e4] bg-white p-3 text-center dark:border-nexus-800 dark:bg-nexus-900">
            <p className="text-lg font-semibold">{col.items.length}</p>
            <p className="text-xs text-secondary">{col.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
