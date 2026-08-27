"use client";

import { useMemo, useState } from "react";
import { PageHeader, FilterBar, Input, Select, DataTable, Badge, StatusBadge } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useHydrated } from "@/hooks/useApp";
import { formatDate } from "@/lib/formatters";

export default function UgcOpportunitiesPage() {
  const hydrated = useHydrated();
  const opportunities = useAppStore((s) => s.opportunities);
  const organizations = useAppStore((s) => s.organizations);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");

  const orgMap = Object.fromEntries(organizations.map((o) => [o.id, o]));
  const filtered = useMemo(
    () =>
      opportunities
        .filter((o) => type === "all" || o.type === type)
        .filter((o) => !search || o.title.toLowerCase().includes(search.toLowerCase())),
    [opportunities, search, type]
  );

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Opportunities" description="National monitoring of published and pending opportunities" />
      <FilterBar>
        <Input label="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select label="Type" value={type} onChange={(e) => setType(e.target.value)} options={[{ value: "all", label: "All" }, ...[...new Set(opportunities.map((o) => o.type))].slice(0, 12).map((t) => ({ value: t, label: t }))]} />
      </FilterBar>
      <DataTable
        columns={[
          { key: "title", label: "Title" },
          { key: "type", label: "Type" },
          { key: "org", label: "Organization", render: (r) => orgMap[r.organizationId]?.name },
          { key: "division", label: "Division" },
          { key: "ugc", label: "UGC", render: (r) => (r.ugcProgrammeId ? <Badge tone="violet">Programme</Badge> : "—") },
          { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status || r.verificationStatus} /> },
          { key: "deadline", label: "Deadline", render: (r) => formatDate(r.deadline) },
        ]}
        rows={filtered.map((o) => ({ ...o, id: o.id }))}
      />
    </div>
  );
}
