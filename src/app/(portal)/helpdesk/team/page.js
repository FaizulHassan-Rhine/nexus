"use client";

import { PageHeader, DataTable, Badge } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useHydrated } from "@/hooks/useApp";
import { agentWorkload } from "../_lib/helpers";

export default function HelpdeskTeamPage() {
  const hydrated = useHydrated();
  const users = useAppStore((s) => s.users);
  const tickets = useAppStore((s) => s.tickets);
  const workload = agentWorkload(tickets, users);

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Team" description="Helpdesk agents and workload distribution" />
      <DataTable
        columns={[
          { key: "name", label: "Agent" },
          { key: "email", label: "Email" },
          { key: "designation", label: "Role" },
          { key: "open", label: "Open tickets", render: (r) => <Badge tone="teal">{r.open}</Badge> },
          { key: "resolved", label: "Resolved", render: (r) => r.resolved },
        ]}
        rows={workload.map((w) => ({ id: w.agent.id, name: w.agent.name, email: w.agent.email, designation: w.agent.designation, open: w.assigned, resolved: w.resolved }))}
      />
    </div>
  );
}
