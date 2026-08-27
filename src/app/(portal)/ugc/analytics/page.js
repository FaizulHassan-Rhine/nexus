"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from "recharts";
import { PageHeader, ChartCard, StatCard, Button } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useHydrated } from "@/hooks/useApp";
import { downloadCsv } from "@/lib/exporters";
import { toast } from "sonner";
import { nationalStats } from "../_lib/helpers";
import { formatCurrency } from "@/lib/formatters";

const COLORS = ["#0d9488", "#6366f1", "#f59e0b", "#0891b2"];

export default function AnalyticsPage() {
  const hydrated = useHydrated();
  const state = useAppStore();
  const stats = useMemo(() => nationalStats(state), [state]);
  const programmes = useAppStore((s) => s.programmes);
  const applications = useAppStore((s) => s.applications);
  const funding = useAppStore((s) => s.funding);

  const monthly = [
    { month: "Apr", apps: 45, funding: 12 },
    { month: "May", apps: 62, funding: 18 },
    { month: "Jun", apps: 78, funding: 22 },
    { month: "Jul", apps: 95, funding: 28 },
    { month: "Aug", apps: applications.length, funding: funding.length },
  ];

  const exportCsv = () => {
    downloadCsv(
      "ugc-national-analytics",
      programmes.map((p) => ({ programme: p.name, budget: p.budget, used: p.used, status: p.status })),
      [
        { key: "programme", label: "Programme" },
        { key: "budget", label: "Budget" },
        { key: "used", label: "Used" },
        { key: "status", label: "Status" },
      ]
    );
    toast.success("CSV exported");
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-8">
      <PageHeader title="Advanced analytics" description="National trends across applications, funding, and programmes" actions={<Button onClick={exportCsv}>Export CSV</Button>} />
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Total applications" value={stats.applications} tone="teal" />
        <StatCard label="Funding requests" value={funding.length} tone="blue" />
        <StatCard label="Total disbursed" value={formatCurrency(programmes.reduce((s, p) => s + p.used, 0))} tone="violet" />
        <StatCard label="Open disputes" value={stats.openDisputes} tone="red" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Monthly applications vs funding requests">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthly}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="apps" stroke="#0d9488" name="Applications" />
              <Line type="monotone" dataKey="funding" stroke="#6366f1" name="Funding" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Programme spend">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={programmes.map((p) => ({ name: p.name.split(" ")[0], used: p.used / 1000000 }))}>
              <XAxis dataKey="name" tick={{ fontSize: 9 }} />
              <YAxis />
              <Tooltip formatter={(v) => `${v}M BDT`} />
              <Bar dataKey="used">{programmes.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
