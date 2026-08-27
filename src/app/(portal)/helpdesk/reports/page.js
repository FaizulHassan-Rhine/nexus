"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { PageHeader, ChartCard, StatCard, Button } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useHydrated } from "@/hooks/useApp";
import { downloadCsv } from "@/lib/exporters";
import { toast } from "sonner";
import { ticketStats, agentWorkload } from "../_lib/helpers";

const COLORS = ["#0d9488", "#6366f1", "#f59e0b"];

export default function HelpdeskReportsPage() {
  const hydrated = useHydrated();
  const tickets = useAppStore((s) => s.tickets);
  const users = useAppStore((s) => s.users);
  const stats = useMemo(() => ticketStats(tickets), [tickets]);
  const workload = useMemo(() => agentWorkload(tickets, users), [tickets, users]);

  const exportCsv = () => {
    downloadCsv(
      "helpdesk-report",
      tickets.map((t) => ({ id: t.id, subject: t.subject, category: t.category, priority: t.priority, status: t.status, satisfaction: t.satisfactionRating })),
      [
        { key: "id", label: "ID" },
        { key: "subject", label: "Subject" },
        { key: "category", label: "Category" },
        { key: "priority", label: "Priority" },
        { key: "status", label: "Status" },
        { key: "satisfaction", label: "CSAT" },
      ]
    );
    toast.success("Report exported");
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-8">
      <PageHeader title="Reports" description="Helpdesk performance and SLA metrics" actions={<Button onClick={exportCsv}>Export CSV</Button>} />
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Total tickets" value={tickets.length} tone="teal" />
        <StatCard label="24h rate" value={`${stats.rate24h}%`} tone="green" />
        <StatCard label="FRT (avg)" value={`${stats.frtHours}h`} tone="blue" />
        <StatCard label="CSAT" value={stats.satisfaction} tone="violet" />
      </div>
      <ChartCard title="Agent workload">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={workload.map((w) => ({ name: w.agent.name.split(" ")[0], assigned: w.assigned, resolved: w.resolved }))}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="assigned" fill="#6366f1" name="Open" />
            <Bar dataKey="resolved" fill="#0d9488" name="Resolved" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
