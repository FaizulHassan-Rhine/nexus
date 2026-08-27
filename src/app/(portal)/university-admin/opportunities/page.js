"use client";

import { useMemo, useState } from "react";
import { PageHeader, FilterBar, DataTable, Input, Select, StatusBadge, Button } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { toast } from "sonner";
import { getUniversityId } from "../_lib/helpers";
import { formatDate } from "@/lib/formatters";

export default function OpportunitiesPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const uniId = getUniversityId(user);
  const opportunities = useAppStore((s) => s.opportunities);
  const organizations = useAppStore((s) => s.organizations);
  const editOpportunity = useAppStore((s) => s.editOpportunity);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const orgMap = Object.fromEntries(organizations.map((o) => [o.id, o]));
  const filtered = useMemo(
    () =>
      opportunities
        .filter((o) => !o.universityId || o.universityId === uniId)
        .filter((o) => status === "all" || o.verificationStatus === status || o.status === status)
        .filter((o) => !search || o.title.toLowerCase().includes(search.toLowerCase())),
    [opportunities, uniId, status, search]
  );

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Opportunities" description="Monitor and verify opportunities relevant to your university" />
      <FilterBar>
        <Input label="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} options={[{ value: "all", label: "All" }, { value: "Pending", label: "Pending verification" }, { value: "Verified", label: "Verified" }, { value: "Published", label: "Published" }]} />
      </FilterBar>
      <DataTable
        columns={[
          { key: "title", label: "Title" },
          { key: "type", label: "Type" },
          { key: "org", label: "Organization", render: (r) => orgMap[r.organizationId]?.name || "—" },
          { key: "verificationStatus", label: "Verification", render: (r) => <StatusBadge status={r.verificationStatus || r.status} /> },
          { key: "deadline", label: "Deadline", render: (r) => formatDate(r.deadline) },
          {
            key: "actions",
            label: "",
            render: (r) =>
              r.verificationStatus === "Pending" ? (
                <Button size="sm" onClick={() => { editOpportunity(r.id, { verificationStatus: "Verified" }); toast.success("Verified"); }}>Verify</Button>
              ) : null,
          },
        ]}
        rows={filtered.map((o) => ({ ...o, id: o.id }))}
      />
    </div>
  );
}
