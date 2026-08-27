"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader, FilterBar, Select, Input, DataTable, StatusBadge, Badge, Button } from "@/components/ui";
import { SlaBadge } from "@/components/domain/Domain";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { formatDate, formatRelative } from "@/lib/formatters";
import { toast } from "sonner";

export default function TicketsPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const searchParams = useSearchParams();
  const tickets = useAppStore((s) => s.tickets);
  const users = useAppStore((s) => s.users);
  const updateTicket = useAppStore((s) => s.updateTicket);

  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const mineOnly = searchParams.get("mine") === "1";

  const filtered = useMemo(() => {
    return tickets
      .filter((t) => !mineOnly || t.assignedTo === user?.id)
      .filter((t) => status === "all" || t.status === status)
      .filter((t) => priority === "all" || t.priority === priority)
      .filter((t) => category === "all" || t.category === category)
      .filter((t) => !search || t.subject.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [tickets, status, priority, category, search, mineOnly, user]);

  const claim = (id) => {
    updateTicket(id, { assignedTo: user?.id, status: "In progress" });
    toast.success("Ticket assigned to you");
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Tickets" description={`${filtered.length} tickets · filter by queue`} />
      <FilterBar>
        <Input label="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} options={[{ value: "all", label: "All" }, ...[...new Set(tickets.map((t) => t.status))].map((s) => ({ value: s, label: s }))]} />
        <Select label="Priority" value={priority} onChange={(e) => setPriority(e.target.value)} options={[{ value: "all", label: "All" }, "Critical", "High", "Medium", "Low"]} />
        <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)} options={[{ value: "all", label: "All" }, ...[...new Set(tickets.map((t) => t.category))].map((c) => ({ value: c, label: c }))]} />
      </FilterBar>
      <DataTable
        columns={[
          { key: "subject", label: "Subject", render: (r) => <Link href={`/helpdesk/tickets/${r.id}`} className="font-medium text-nexus-700">{r.subject}</Link> },
          { key: "category", label: "Category" },
          { key: "priority", label: "Priority", render: (r) => <Badge tone={r.priority === "Critical" ? "red" : r.priority === "High" ? "amber" : "slate"}>{r.priority}</Badge> },
          { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
          { key: "requester", label: "Requester", render: (r) => users.find((u) => u.id === r.requesterId)?.name?.split(" ")[0] },
          { key: "assignee", label: "Assignee", render: (r) => users.find((u) => u.id === r.assignedTo)?.name || "Unassigned" },
          { key: "sla", label: "SLA", render: (r) => <SlaBadge deadline={r.slaDeadline} /> },
          { key: "created", label: "Created", render: (r) => formatRelative(r.createdAt) },
          { key: "actions", label: "", render: (r) => !r.assignedTo ? <Button size="sm" onClick={() => claim(r.id)}>Claim</Button> : null },
        ]}
        rows={filtered.map((t) => ({ ...t, id: t.id }))}
      />
    </div>
  );
}
