"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader, DataTable, FilterBar } from "@/components/ui";
import { Button, Select, StatusBadge, Badge, Modal, DropdownMenu } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { formatDate } from "@/lib/formatters";
import { toast } from "sonner";
import {
  getOrgOpportunities,
  pauseOpportunity,
  archiveOpportunity,
  duplicateOpportunity,
} from "../_lib/helpers";

const STATUS_TABS = ["All", "Draft", "Published", "Paused", "Closed", "Archived"];

export default function OrganizationOpportunitiesPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const router = useRouter();
  const opportunities = useAppStore((s) => s.opportunities);
  const publishOpportunity = useAppStore((s) => s.publishOpportunity);
  const closeOpportunity = useAppStore((s) => s.closeOpportunity);
  const applications = useAppStore((s) => s.applications);

  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("all");
  const [preview, setPreview] = useState(null);

  const orgOpps = useMemo(
    () => getOrgOpportunities(opportunities, user?.organizationId),
    [opportunities, user]
  );

  const filtered = useMemo(() => {
    return orgOpps
      .filter((o) => statusFilter === "All" || o.status === statusFilter || (statusFilter === "Published" && (!o.status || o.status === "Open")))
      .filter((o) => typeFilter === "all" || o.type === typeFilter);
  }, [orgOpps, statusFilter, typeFilter]);

  const types = [...new Set(orgOpps.map((o) => o.type))];

  const appCount = (oppId) => applications.filter((a) => a.opportunityId === oppId).length;

  const handlePublish = (id) => {
    publishOpportunity(id);
    toast.success("Opportunity published");
  };

  const handlePause = (id) => {
    pauseOpportunity(id);
    toast.success("Opportunity paused");
  };

  const handleClose = (id) => {
    closeOpportunity(id);
    toast.success("Opportunity closed");
  };

  const handleArchive = (id) => {
    archiveOpportunity(id);
    toast.success("Opportunity archived");
  };

  const handleDuplicate = (opp) => {
    const copy = duplicateOpportunity(opp);
    toast.success("Draft duplicate created");
    router.push(`/organization/opportunities/${copy.id}`);
  };

  if (!hydrated) return null;

  const columns = [
    { key: "title", label: "Title", render: (row) => (
      <Link href={`/organization/opportunities/${row.id}`} className="font-medium text-nexus-700 hover:underline">
        {row.title}
      </Link>
    )},
    { key: "type", label: "Type", render: (row) => <Badge tone="teal">{row.type}</Badge> },
    { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status || "Published"} /> },
    { key: "deadline", label: "Deadline", render: (row) => formatDate(row.deadline) },
    { key: "apps", label: "Applications", render: (row) => appCount(row.id) },
    { key: "views", label: "Views", render: (row) => row.metrics?.views ?? 0 },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <DropdownMenu
          trigger={<Button size="sm" variant="ghost">Actions</Button>}
          items={[
            { label: "Edit", onClick: () => router.push(`/organization/opportunities/${row.id}`) },
            { label: "Preview", onClick: () => setPreview(row) },
            { label: "Duplicate", onClick: () => handleDuplicate(row) },
            { divider: true },
            ...(row.status === "Draft" || row.status === "Paused" ? [{ label: "Publish", onClick: () => handlePublish(row.id) }] : []),
            ...(row.status === "Published" || !row.status ? [{ label: "Pause", onClick: () => handlePause(row.id) }] : []),
            ...(row.status !== "Closed" && row.status !== "Archived" ? [{ label: "Close", onClick: () => handleClose(row.id) }] : []),
            { label: "Archive", onClick: () => handleArchive(row.id) },
            { label: "View candidates", onClick: () => router.push(`/organization/opportunities/${row.id}?tab=candidates`) },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Opportunities"
        description={`${orgOpps.length} total · ${orgOpps.filter((o) => o.status === "Published" || !o.status).length} active`}
        actions={<Button onClick={() => router.push("/organization/opportunities/new")}>Create opportunity</Button>}
      />

      <FilterBar>
        <Select
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={STATUS_TABS.map((s) => ({ value: s, label: s }))}
        />
        <Select
          label="Type"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          options={[{ value: "all", label: "All types" }, ...types.map((t) => ({ value: t, label: t }))]}
        />
      </FilterBar>

      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((s) => (
          <Button
            key={s}
            size="sm"
            variant={statusFilter === s ? "primary" : "secondary"}
            onClick={() => setStatusFilter(s)}
          >
            {s} ({s === "All" ? orgOpps.length : orgOpps.filter((o) => o.status === s || (s === "Published" && (!o.status || o.status === "Open"))).length})
          </Button>
        ))}
      </div>

      <DataTable columns={columns} rows={filtered} emptyMessage="No opportunities match your filters." />

      <Modal open={!!preview} onClose={() => setPreview(null)} title="Opportunity preview">
        {preview ? (
          <div className="space-y-3 text-sm">
            <Badge tone="teal">{preview.type}</Badge>
            <h3 className="text-lg font-semibold">{preview.title}</h3>
            <p className="text-secondary">{preview.description}</p>
            <p>Deadline: {formatDate(preview.deadline)} · {preview.workMode} · {preview.location}</p>
            <div className="flex gap-2">
              <Link href={`/opportunities/${preview.slug}`} target="_blank">
                <Button variant="secondary" size="sm">Public page</Button>
              </Link>
              <Button size="sm" onClick={() => { setPreview(null); router.push(`/organization/opportunities/${preview.id}`); }}>Edit</Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
