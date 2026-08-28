"use client";

import { useMemo, useState } from "react";
import { PageHeader, DataTable } from "@/components/ui";
import { Tabs, TabList, Tab, TabPanel } from "@/components/ui";
import { StatusBadge, EmptyState, Modal } from "@/components/ui";
import { ApplicationTimeline } from "@/components/domain/Domain";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { applicationService } from "@/lib/mockServices";
import { formatDate, formatRelative } from "@/lib/formatters";
import { toast } from "sonner";
import {
  getResearcherApplications,
  filterApplicationsByTab,
  APPLICATION_TABS,
} from "../_lib/helpers";

const TAB_KEYS = Object.keys(APPLICATION_TABS);

export default function ResearcherApplicationsPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const opportunities = useAppStore((s) => s.opportunities);
  const applications = useAppStore((s) => s.applications);

  const [detailApp, setDetailApp] = useState(null);
  const [withdrawing, setWithdrawing] = useState(null);

  const userApps = useMemo(
    () => (user ? getResearcherApplications(applications, user.id) : []),
    [applications, user]
  );

  const columns = [
    {
      key: "title",
      label: "Opportunity",
      render: (row) => {
        const opp = opportunities.find((o) => o.id === row.opportunityId);
        return (
          <button type="button" className="font-medium text-nexus-700 hover:underline" onClick={() => setDetailApp(row)}>
            {opp?.title || row.opportunityId}
          </button>
        );
      },
    },
    {
      key: "type",
      label: "Type",
      render: (row) => opportunities.find((o) => o.id === row.opportunityId)?.type || "—",
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "submittedAt",
      label: "Submitted",
      render: (row) => formatDate(row.submittedAt),
    },
    {
      key: "updatedAt",
      label: "Updated",
      render: (row) => formatRelative(row.updatedAt),
    },
  ];

  const withdraw = async (appId) => {
    setWithdrawing(appId);
    try {
      await applicationService.withdraw(appId);
      toast.success("Application withdrawn");
      setDetailApp(null);
    } finally {
      setWithdrawing(null);
    }
  };

  if (!hydrated) return null;

  const detailOpp = detailApp ? opportunities.find((o) => o.id === detailApp.opportunityId) : null;

  return (
    <div className="space-y-6">
      <PageHeader title="Applications" description="Grant submissions, collaboration requests, and university endorsement timelines" />

      <Tabs defaultValue="Active">
        <TabList>
          {TAB_KEYS.map((tab) => {
            const count = filterApplicationsByTab(userApps, tab).length;
            return (
              <Tab key={tab} value={tab}>
                {tab} ({count})
              </Tab>
            );
          })}
        </TabList>

        {TAB_KEYS.map((tab) => {
          const rows = filterApplicationsByTab(userApps, tab);
          return (
            <TabPanel key={tab} value={tab}>
              {rows.length ? (
                <DataTable columns={columns} rows={rows} />
              ) : (
                <EmptyState
                  title={`No ${tab.toLowerCase()} applications`}
                  description="Browse research opportunities and submit applications."
                />
              )}
            </TabPanel>
          );
        })}
      </Tabs>

      <Modal open={Boolean(detailApp)} onClose={() => setDetailApp(null)} title={detailOpp?.title || "Application detail"}>
        {detailApp ? (
          <div className="space-y-4">
            <StatusBadge status={detailApp.status} />
            <p className="text-sm text-secondary">{detailOpp?.type} · Submitted {formatDate(detailApp.submittedAt)}</p>
            {detailApp.reviewerFeedback ? (
              <p className="rounded-lg bg-amber-50 p-3 text-sm dark:bg-amber-950">{detailApp.reviewerFeedback}</p>
            ) : null}
            <ApplicationTimeline events={detailApp.timeline || []} />
            {!["Withdrawn", "Rejected", "Completed"].includes(detailApp.status) ? (
              <button
                type="button"
                className="text-sm text-danger"
                disabled={withdrawing === detailApp.id}
                onClick={() => withdraw(detailApp.id)}
              >
                Withdraw application
              </button>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
