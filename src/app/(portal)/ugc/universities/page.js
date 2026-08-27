"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PageHeader, FilterBar, Input, Select, DataTable, Badge, StatusBadge } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useHydrated } from "@/hooks/useApp";

export default function UniversitiesPage() {
  const hydrated = useHydrated();
  const universities = useAppStore((s) => s.universities);
  const [search, setSearch] = useState("");
  const [division, setDivision] = useState("all");

  const filtered = useMemo(
    () =>
      universities
        .filter((u) => division === "all" || u.division === division)
        .filter((u) => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.shortName?.toLowerCase().includes(search.toLowerCase())),
    [universities, search, division]
  );

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Universities" description={`${universities.length} institutions on Nexus`} />
      <FilterBar>
        <Input label="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select label="Division" value={division} onChange={(e) => setDivision(e.target.value)} options={[{ value: "all", label: "All" }, ...[...new Set(universities.map((u) => u.division))].map((d) => ({ value: d, label: d }))]} />
      </FilterBar>
      <DataTable
        columns={[
          { key: "name", label: "University", render: (r) => <Link href={`/ugc/universities/${r.id}`} className="font-medium text-nexus-700">{r.shortName} — {r.name}</Link> },
          { key: "division", label: "Division" },
          { key: "studentCount", label: "Students" },
          { key: "activePartnerships", label: "Partners" },
          { key: "nexusStatus", label: "Status", render: (r) => <StatusBadge status={r.nexusStatus} /> },
          { key: "verificationStatus", label: "Verified", render: (r) => <Badge tone="green">{r.verificationStatus}</Badge> },
        ]}
        rows={filtered.map((u) => ({ ...u, id: u.id }))}
      />
    </div>
  );
}
