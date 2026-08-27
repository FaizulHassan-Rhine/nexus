"use client";

import Link from "next/link";
import { PageHeader, StatCard, Button } from "@/components/ui";
import { SlaBadge } from "@/components/domain/Domain";
import { useAppStore } from "@/store/useAppStore";
import { useHydrated } from "@/hooks/useApp";
import { ticketStats } from "@/app/(portal)/helpdesk/_lib/helpers";

export default function UgcHelpdeskPage() {
  const hydrated = useHydrated();
  const tickets = useAppStore((s) => s.tickets);
  const stats = ticketStats(tickets);

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Helpdesk overview" description="National SLA summary — agents work in the helpdesk portal" actions={<Link href="/helpdesk/dashboard"><Button>Open helpdesk portal</Button></Link>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Open tickets" value={stats.open} tone="amber" />
        <StatCard label="Unassigned" value={stats.unassigned} tone="red" />
        <StatCard label="SLA due (<4h)" value={stats.slaDue} tone="amber" />
        <StatCard label="SLA breached" value={stats.breached} tone="red" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="24h resolution rate" value={`${stats.rate24h}%`} tone="green" />
        <StatCard label="First response (avg)" value={`${stats.frtHours}h`} tone="teal" />
        <StatCard label="Satisfaction" value={stats.satisfaction} tone="violet" />
      </div>
      <div className="card-surface p-4">
        <h3 className="font-semibold">Critical tickets</h3>
        <ul className="mt-3 space-y-2 text-sm">
          {tickets.filter((t) => t.priority === "Critical" && t.status !== "Resolved").map((t) => (
            <li key={t.id} className="flex justify-between rounded-lg border px-3 py-2 dark:border-slate-700">
              <Link href={`/helpdesk/tickets/${t.id}`} className="hover:text-nexus-700">{t.subject}</Link>
              <SlaBadge deadline={t.slaDeadline} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
