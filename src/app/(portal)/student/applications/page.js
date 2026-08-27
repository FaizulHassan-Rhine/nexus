"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader, DataTable } from "@/components/ui";
import { Tabs, TabList, Tab, TabPanel } from "@/components/ui";
import { StatusBadge, EmptyState } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { formatDate, formatRelative } from "@/lib/formatters";
import { getStudentApplications, filterApplicationsByTab, APPLICATION_TABS } from "../_lib/helpers";

const TAB_KEYS = Object.keys(APPLICATION_TABS);

export default function ApplicationsPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const router = useRouter();
  const opportunities = useAppStore((s) => s.opportunities);
  const applications = useAppStore((s) => s.applications);

  const userApps = useMemo(
    () => (user ? getStudentApplications(applications, user.id) : []),
    [applications, user]
  );

  const columns = [
    {
      key: "title",
      label: "Opportunity",
      render: (row) => {
        const opp = opportunities.find((o) => o.id === row.opportunityId);
        return (
          <Link href={`/student/applications/${row.id}`} className="font-medium text-nexus-700 hover:underline">
            {opp?.title || row.opportunityId}
          </Link>
        );
      },
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

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Applications"
        description="Track drafts, active applications, interviews, offers, and outcomes"
      />

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
                  description="Browse matches and apply to opportunities to see them here."
                  action={
                    <button
                      type="button"
                      className="text-sm font-medium text-nexus-700"
                      onClick={() => router.push("/student/matches")}
                    >
                      View matches
                    </button>
                  }
                />
              )}
            </TabPanel>
          );
        })}
      </Tabs>
    </div>
  );
}
