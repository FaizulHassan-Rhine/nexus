"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader, FilterBar, DataTable, Tabs, TabList, Tab, TabPanel, Select, Input, Button, Badge, StatusBadge } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { formatDate, formatRelative } from "@/lib/formatters";
import { toast } from "sonner";
import { buildReviewQueue, getUniversityId, mergeAssignment, REVIEW_TABS } from "../_lib/helpers";

export default function ReviewQueuePage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const uniId = getUniversityId(user);
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "verification";

  const state = useAppStore();
  const reviewAssignments = useAppStore((s) => s.reviewAssignments);
  const assignReviewItem = useAppStore((s) => s.assignReviewItem);
  const team = useAppStore((s) => s.users).filter((u) => u.role === "university-admin" && u.universityId === uniId);

  const [tab, setTab] = useState(initialTab);
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [assigning, setAssigning] = useState(null);

  const queue = useMemo(
    () =>
      buildReviewQueue(
        {
          users: state.users,
          matches: state.matches,
          applications: state.applications,
          opportunities: state.opportunities,
          funding: state.funding,
          technologies: state.technologies,
          scholarships: state.scholarships,
        },
        uniId
      ).map((item) => mergeAssignment(item, reviewAssignments)),
    [state, uniId, reviewAssignments]
  );

  const filtered = queue
    .filter((item) => item.type === tab)
    .filter((item) => priorityFilter === "all" || item.priority === priorityFilter)
    .filter((item) => !search || item.title.toLowerCase().includes(search.toLowerCase()));

  const handleAssign = (key, assignedTo, priority) => {
    assignReviewItem(key, { assignedTo, priority });
    toast.success("Assignment updated");
    setAssigning(null);
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Review queue" description={`${queue.length} items across all categories · BUET Industry Collaboration Office`} />

      <Tabs value={tab} onChange={setTab}>
        <TabList className="flex-wrap">
          {REVIEW_TABS.map((t) => (
            <Tab key={t.id} value={t.id}>
              {t.label} ({queue.filter((q) => q.type === t.id).length})
            </Tab>
          ))}
        </TabList>

        {REVIEW_TABS.map((t) => (
          <TabPanel key={t.id} value={t.id}>
            <FilterBar>
              <Input label="Search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter by title..." />
              <Select
                label="Priority"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                options={[
                  { value: "all", label: "All priorities" },
                  { value: "High", label: "High" },
                  { value: "Medium", label: "Medium" },
                  { value: "Low", label: "Low" },
                ]}
              />
            </FilterBar>

            <DataTable
              columns={[
                {
                  key: "title",
                  label: "Item",
                  render: (row) => (
                    <Link href={`/university-admin/review-queue/${encodeURIComponent(row.key)}`} className="font-medium text-nexus-700 hover:underline">
                      {row.title}
                    </Link>
                  ),
                },
                { key: "subtitle", label: "Details" },
                { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
                {
                  key: "priority",
                  label: "Priority",
                  render: (row) => <Badge tone={row.priority === "High" ? "red" : row.priority === "Medium" ? "amber" : "slate"}>{row.priority}</Badge>,
                },
                {
                  key: "assignedTo",
                  label: "Assignee",
                  render: (row) => team.find((m) => m.id === row.assignedTo)?.name || "Unassigned",
                },
                { key: "createdAt", label: "Submitted", render: (row) => formatRelative(row.createdAt) },
                {
                  key: "actions",
                  label: "Actions",
                  render: (row) => (
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setAssigning(row.key)}>Assign</Button>
                      <Link href={`/university-admin/review-queue/${encodeURIComponent(row.key)}`}>
                        <Button size="sm" variant="secondary">Open</Button>
                      </Link>
                    </div>
                  ),
                },
              ]}
              rows={filtered.map((r) => ({ ...r, id: r.key }))}
              emptyMessage={`No ${t.label.toLowerCase()} items in queue.`}
            />
          </TabPanel>
        ))}
      </Tabs>

      {assigning ? (
        <div className="card-surface fixed bottom-6 right-6 z-40 w-80 space-y-3 p-4 shadow-xl">
          <p className="font-semibold">Assign review item</p>
          <Select
            label="Team member"
            value=""
            onChange={(e) => handleAssign(assigning, e.target.value, reviewAssignments[assigning]?.priority || "Medium")}
            options={[{ value: "", label: "Select..." }, ...team.map((m) => ({ value: m.id, label: m.name }))]}
          />
          <Select
            label="Priority"
            value={reviewAssignments[assigning]?.priority || "Medium"}
            onChange={(e) => assignReviewItem(assigning, { priority: e.target.value, assignedTo: reviewAssignments[assigning]?.assignedTo })}
            options={["High", "Medium", "Low"]}
          />
          <Button size="sm" variant="ghost" onClick={() => setAssigning(null)}>Close</Button>
        </div>
      ) : null}
    </div>
  );
}
