"use client";

import { useMemo, useState } from "react";
import { PageHeader, FilterBar, DataTable, Input, Select, Badge, StatusBadge } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useHydrated } from "@/hooks/useApp";

export default function OrganizationsPage() {
  const hydrated = useHydrated();
  const organizations = useAppStore((s) => s.organizations);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");

  const filtered = useMemo(
    () =>
      organizations
        .filter((o) => type === "all" || o.type === type)
        .filter((o) => !search || o.name.toLowerCase().includes(search.toLowerCase())),
    [organizations, search, type]
  );

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Organizations" description="Partner and recruiting organizations interacting with your students" />
      <FilterBar>
        <Input label="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select label="Type" value={type} onChange={(e) => setType(e.target.value)} options={[{ value: "all", label: "All types" }, ...[...new Set(organizations.map((o) => o.type))].map((t) => ({ value: t, label: t }))]} />
      </FilterBar>
      <DataTable
        columns={[
          { key: "name", label: "Organization" },
          { key: "type", label: "Type" },
          { key: "division", label: "Division" },
          { key: "verificationStatus", label: "Verification", render: (r) => <StatusBadge status={r.verificationStatus} /> },
          { key: "nexusStatus", label: "Nexus", render: (r) => <Badge tone={r.nexusStatus === "Suspended" ? "red" : "green"}>{r.nexusStatus || "Active"}</Badge> },
          { key: "activeOpportunities", label: "Opportunities", render: (r) => r.activeOpportunities ?? "—" },
        ]}
        rows={filtered.map((o) => ({ ...o, id: o.id }))}
      />
    </div>
  );
}
