"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader, SectionHeader } from "@/components/ui";
import { Button, DropdownMenu, StatusBadge, Avatar } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { applicationService } from "@/lib/mockServices";
import { formatDate } from "@/lib/formatters";
import { toast } from "sonner";
import {
  PIPELINE_COLUMNS,
  getOrgApplications,
} from "../_lib/helpers";

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
        actions={<Button variant="secondary" onClick={() => toast.message("Drag-and-drop optional — all moves available via menu")}>Help</Button>}
      />

      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => (
          <section
            key={col.id}
            className="min-w-[260px] flex-1 rounded-xl border border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-900/50"
            aria-label={`${col.label} column`}
          >
            <header className="border-b border-slate-200 px-3 py-2 dark:border-slate-700">
              <h2 className="text-sm font-semibold">{col.label}</h2>
              <p className="text-xs text-secondary">{col.items.length} candidates</p>
            </header>
            <ul className="space-y-2 p-2" role="list">
              {col.items.map((app) => {
                const candidate = users.find((u) => u.id === app.applicantId);
                const opp = opportunities.find((o) => o.id === app.opportunityId);
                const nextOptions = NEXT_STATUS[col.id] || [];
                return (
                  <li key={app.id}>
                    <article
                      tabIndex={0}
                      role="button"
                      aria-label={`${candidate?.name || "Candidate"} — ${app.status}. Press Enter to advance.`}
                      className={`card-surface cursor-pointer p-3 text-sm outline-none focus:ring-2 focus:ring-nexus-500 ${focusedCard === app.id ? "ring-2 ring-nexus-400" : ""}`}
                      onFocus={() => setFocusedCard(app.id)}
                      onKeyDown={(e) => handleKeyMove(e, app, col.id)}
                    >
                      <div className="flex items-center gap-2">
                        <Avatar name={candidate?.name} src={candidate?.avatar} size="sm" />
                        <div className="min-w-0 flex-1">
                          <Link href={`/organization/candidates/${app.applicantId}`} className="block truncate font-medium hover:text-nexus-700">
                            {candidate?.name || app.applicantId}
                          </Link>
                          <p className="truncate text-xs text-secondary">{opp?.title}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <StatusBadge status={app.status} />
                        <span className="text-xs text-secondary">{formatDate(app.updatedAt || app.submittedAt)}</span>
                      </div>
                      {nextOptions.length ? (
                        <div className="mt-2">
                          <DropdownMenu
                            trigger={
                              <Button size="sm" variant="ghost" className="w-full" aria-haspopup="menu">
                                Move to…
                              </Button>
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
                <li className="px-3 py-6 text-center text-xs text-secondary">Empty</li>
              )}
            </ul>
          </section>
        ))}
      </div>

      <SectionHeader title="Pipeline summary" description="Distribution across stages" />
      <div className="grid gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {columns.map((col) => (
          <div key={col.id} className="card-surface p-3 text-center">
            <p className="text-lg font-semibold">{col.items.length}</p>
            <p className="text-xs text-secondary">{col.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
