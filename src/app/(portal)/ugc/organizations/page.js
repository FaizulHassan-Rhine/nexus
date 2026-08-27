"use client";

import { useMemo, useState } from "react";
import { PageHeader, FilterBar, Input, Select, DataTable, Button, Badge, StatusBadge, Modal, Textarea } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useHydrated } from "@/hooks/useApp";
import { toast } from "sonner";

export default function UgcOrganizationsPage() {
  const hydrated = useHydrated();
  const organizations = useAppStore((s) => s.organizations);
  const updateOrganization = useAppStore((s) => s.updateOrganization);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");

  const filtered = useMemo(
    () =>
      organizations
        .filter((o) => status === "all" || o.verificationStatus === status || o.nexusStatus === status)
        .filter((o) => !search || o.name.toLowerCase().includes(search.toLowerCase())),
    [organizations, search, status]
  );

  const suspend = () => {
    updateOrganization(selected.id, { nexusStatus: "Suspended", suspensionNote: note, verificationStatus: selected.verificationStatus });
    toast.success("Organization suspended (simulation)");
    setSelected(null);
  };

  const restore = (org) => {
    updateOrganization(org.id, { nexusStatus: "Active", suspensionNote: null });
    toast.success("Organization restored");
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Organizations" description="National registry — verification, risk monitoring, suspend/restore simulation" />
      <FilterBar>
        <Input label="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} options={[{ value: "all", label: "All" }, { value: "Verified", label: "Verified" }, { value: "Pending", label: "Pending" }, { value: "Suspended", label: "Suspended" }]} />
      </FilterBar>
      <DataTable
        columns={[
          { key: "name", label: "Organization" },
          { key: "type", label: "Type" },
          { key: "division", label: "Division" },
          { key: "verificationStatus", label: "Verification", render: (r) => <StatusBadge status={r.verificationStatus} /> },
          { key: "risk", label: "Risk", render: (r) => <Badge tone={(r.riskScore || 0) >= 70 ? "red" : (r.riskScore || 0) >= 40 ? "amber" : "green"}>{r.riskScore ?? "Low"}</Badge> },
          { key: "nexusStatus", label: "Nexus", render: (r) => <Badge tone={r.nexusStatus === "Suspended" ? "red" : "green"}>{r.nexusStatus || "Active"}</Badge> },
          {
            key: "actions",
            label: "",
            render: (r) =>
              r.nexusStatus === "Suspended" ? (
                <Button size="sm" onClick={() => restore(r)}>Restore</Button>
              ) : (
                <Button size="sm" variant="danger" onClick={() => setSelected(r)}>Suspend</Button>
              ),
          },
        ]}
        rows={filtered.map((o) => ({ ...o, id: o.id }))}
      />
      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={`Suspend ${selected?.name}?`}>
        <Textarea label="Reason (simulation)" value={note} onChange={(e) => setNote(e.target.value)} />
        <div className="mt-4 flex gap-2">
          <Button variant="danger" onClick={suspend}>Confirm suspend</Button>
          <Button variant="secondary" onClick={() => setSelected(null)}>Cancel</Button>
        </div>
      </Modal>
    </div>
  );
}
