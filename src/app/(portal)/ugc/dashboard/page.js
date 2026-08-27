"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";
import { PageHeader, StatCard, ChartCard, SectionHeader, Button, Badge } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useHydrated } from "@/hooks/useApp";
import { formatCurrency } from "@/lib/formatters";
import { nationalStats, cofundingQueue } from "../_lib/helpers";

const COLORS = ["#0d9488", "#6366f1", "#f59e0b", "#ef4444", "#0891b2", "#8b5cf6", "#ec4899"];

export default function UgcDashboardPage() {
  const hydrated = useHydrated();
  const router = useRouter();
  const state = useAppStore();
  const stats = useMemo(() => nationalStats(state), [state]);
  const programmes = useAppStore((s) => s.programmes);
  const funding = useAppStore((s) => s.funding);
  const universities = useAppStore((s) => s.universities);

  const divisionData = useMemo(() => {
    const counts = {};
    universities.forEach((u) => { counts[u.division] = (counts[u.division] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [universities]);

  const programmeUsage = programmes.map((p) => ({
    name: p.name.split(" ")[0],
    used: Math.round((p.used / p.budget) * 100),
    budget: p.budget,
  }));

  const cofund = cofundingQueue(funding);

  if (!hydrated) return null;

  return (
    <div className="space-y-8">
      <PageHeader title="National dashboard" description="UGC oversight across universities, funding, and compliance" actions={<Button onClick={() => router.push("/ugc/analytics")}>Advanced analytics</Button>} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Universities" value={stats.universities} tone="teal" />
        <StatCard label="Verified organizations" value={stats.verifiedOrgs} tone="green" />
        <StatCard label="Live opportunities" value={stats.opportunities} tone="violet" />
        <StatCard label="Students on platform" value={stats.students} tone="blue" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Co-funding queue" value={cofund.length} tone="amber" />
        <StatCard label="Open disputes" value={stats.openDisputes} tone="red" />
        <StatCard label="Open tickets" value={stats.openTickets} tone="amber" />
        <StatCard label="Programme budget used" value={`${Math.round(programmes.reduce((s, p) => s + p.used, 0) / programmes.reduce((s, p) => s + p.budget, 0) * 100)}%`} tone="violet" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Universities by division">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={divisionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {divisionData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Programme budget utilisation (%)" summary="National programmes">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={programmeUsage}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(v) => `${v}%`} />
              <Bar dataKey="used" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <SectionHeader title="National programmes" actions={<Link href="/ugc/programmes" className="text-sm text-nexus-700">Manage programmes</Link>} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {programmes.slice(0, 6).map((p) => (
          <div key={p.id} className="card-surface p-4">
            <div className="flex justify-between"><p className="font-semibold">{p.name}</p><Badge tone={p.status === "Active" ? "green" : "amber"}>{p.status}</Badge></div>
            <p className="mt-2 text-sm text-secondary">{formatCurrency(p.used)} of {formatCurrency(p.budget)} used</p>
          </div>
        ))}
      </div>
    </div>
  );
}
