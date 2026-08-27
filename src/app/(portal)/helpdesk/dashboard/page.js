"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { PageHeader, StatCard, ChartCard, SectionHeader, Button, Badge } from "@/components/ui";
import { SlaBadge } from "@/components/domain/Domain";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { ticketStats, agentWorkload } from "../_lib/helpers";

const COLORS = ["#0d9488", "#6366f1", "#f59e0b", "#ef4444", "#0891b2"];

export default function HelpdeskDashboardPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const router = useRouter();
  const tickets = useAppStore((s) => s.tickets);
  const users = useAppStore((s) => s.users);
  const stats = useMemo(() => ticketStats(tickets), [tickets]);
  const workload = useMemo(() => agentWorkload(tickets, users), [tickets, users]);
  const categoryData = Object.entries(stats.categories).map(([name, count]) => ({ name, count }));
  const myTickets = tickets.filter((t) => t.assignedTo === user?.id && !["Resolved", "Closed"].includes(t.status));

  if (!hydrated) return null;

  return (
    <div className="space-y-8">
      <PageHeader title="Helpdesk dashboard" description="24-hour SLA target · Tanvir Ahmed, Senior Support Officer" actions={<Button onClick={() => router.push("/helpdesk/tickets")}>Open queue</Button>} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Open tickets" value={stats.open} tone="amber" />
        <StatCard label="Unassigned" value={stats.unassigned} tone="red" />
        <StatCard label="SLA due (<4h)" value={stats.slaDue} tone="amber" />
        <StatCard label="SLA breached" value={stats.breached} tone="red" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="24h resolution rate" value={`${stats.rate24h}%`} tone="green" />
        <StatCard label="First response time" value={`${stats.frtHours}h avg`} tone="teal" />
        <StatCard label="Satisfaction" value={`${stats.satisfaction} / 5`} tone="violet" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Tickets by category">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryData}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count">{categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <div className="card-surface p-4">
          <SectionHeader title="Agent workload" />
          <ul className="space-y-2 text-sm">
            {workload.map(({ agent, assigned, resolved }) => (
              <li key={agent.id} className="flex justify-between rounded-lg border px-3 py-2 dark:border-slate-700">
                <span>{agent.name}</span>
                <span><Badge tone="teal">{assigned} open</Badge> · {resolved} resolved</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card-surface p-4">
        <SectionHeader title="My assigned tickets" actions={<Link href="/helpdesk/tickets?mine=1" className="text-sm text-nexus-700">View all</Link>} />
        <ul className="space-y-2 text-sm">
          {myTickets.slice(0, 5).map((t) => (
            <li key={t.id} className="flex items-center justify-between rounded-lg border px-3 py-2 dark:border-slate-700">
              <Link href={`/helpdesk/tickets/${t.id}`} className="font-medium hover:text-nexus-700">{t.subject}</Link>
              <SlaBadge deadline={t.slaDeadline} />
            </li>
          ))}
          {!myTickets.length && <p className="text-secondary">No tickets assigned to you.</p>}
        </ul>
      </div>
    </div>
  );
}
