"use client";

import { useMemo, useState } from "react";
import { PageHeader, FilterBar, Input, Select } from "@/components/ui";
import { AuditEventList } from "@/components/domain/Domain";
import { useAppStore } from "@/store/useAppStore";
import { useHydrated } from "@/hooks/useApp";

export default function AuditLogPage() {
  const hydrated = useHydrated();
  const audit = useAppStore((s) => s.audit);
  const users = useAppStore((s) => s.users);
  const [search, setSearch] = useState("");
  const [entity, setEntity] = useState("all");

  const filtered = useMemo(
    () =>
      audit
        .filter((e) => entity === "all" || e.entityType === entity)
        .filter((e) => !search || e.action?.includes(search) || e.details?.toLowerCase().includes(search.toLowerCase()))
        .slice(0, 50),
    [audit, search, entity]
  );

  const enriched = filtered.map((e) => ({
    ...e,
    details: `${e.details || e.summary || ""}${users.find((u) => u.id === e.actorId) ? ` · ${users.find((u) => u.id === e.actorId).name}` : ""}`,
  }));

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Audit log" description="Immutable activity trail for compliance and oversight" />
      <FilterBar>
        <Input label="Search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Action or details..." />
        <Select label="Entity type" value={entity} onChange={(e) => setEntity(e.target.value)} options={[{ value: "all", label: "All" }, ...[...new Set(audit.map((a) => a.entityType).filter(Boolean))].map((t) => ({ value: t, label: t }))]} />
      </FilterBar>
      <AuditEventList events={enriched} />
    </div>
  );
}
