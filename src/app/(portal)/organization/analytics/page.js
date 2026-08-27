"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PageHeader, ChartCard, StatCard } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import {
  getOrgOpportunities,
  getOrgApplications,
  getOrgMatches,
  getOrgFunding,
  applicationsByStage,
} from "../_lib/helpers";

const COLORS = ["#0d9488", "#6366f1", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6"];

export default function AnalyticsPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const opportunities = useAppStore((s) => s.opportunities);
  const applications = useAppStore((s) => s.applications);
  const matches = useAppStore((s) => s.matches);
  const funding = useAppStore((s) => s.funding);
  const users = useAppStore((s) => s.users);

  const orgOpps = useMemo(() => getOrgOpportunities(opportunities, user?.organizationId), [opportunities, user]);
  const orgApps = useMemo(
    () => getOrgApplications(applications, opportunities, user?.organizationId),
    [applications, opportunities, user]
  );
  const orgMatches = useMemo(
    () => getOrgMatches(matches, opportunities, user?.organizationId),
    [matches, opportunities, user]
  );
  const orgFunding = useMemo(() => getOrgFunding(funding, user?.organizationId), [funding, user]);

  const viewsData = orgOpps.slice(0, 6).map((o, idx) => ({
    name: o.title.slice(0, 20) + (o.title.length > 20 ? "…" : ""),
    views: o.metrics?.views ?? 120 + ((o.id?.length || 0) * 17 + idx * 41) % 400,
    applications: orgApps.filter((a) => a.opportunityId === o.id).length,
  }));

  const funnelData = useMemo(() => {
    const stages = applicationsByStage(orgApps);
    return Object.entries(stages).map(([name, value]) => ({ name, value })).filter((d) => d.value > 0);
  }, [orgApps]);

  const matchQuality = useMemo(() => {
    const bands = [
      { name: "90+", count: 0 },
      { name: "75-89", count: 0 },
      { name: "60-74", count: 0 },
      { name: "<60", count: 0 },
    ];
    orgMatches.forEach((m) => {
      const s = m.overallScore || 0;
      if (s >= 90) bands[0].count++;
      else if (s >= 75) bands[1].count++;
      else if (s >= 60) bands[2].count++;
      else bands[3].count++;
    });
    return bands;
  }, [orgMatches]);

  const skillDist = useMemo(() => {
    const counts = {};
    orgMatches.forEach((m) => {
      const candidate = users.find((u) => u.id === m.candidateId);
      (candidate?.skills || []).forEach((s) => {
        counts[s] = (counts[s] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));
  }, [orgMatches, users]);

  const cofundUtil = orgFunding.reduce(
    (acc, f) => ({
      requested: acc.requested + (f.requestedAmount || 0),
      approved: acc.approved + (f.approvedAmount || 0),
    }),
    { requested: 0, approved: 0 }
  );
  const utilPct = cofundUtil.requested ? Math.round((cofundUtil.approved / cofundUtil.requested) * 100) : 0;

  const totalViews = orgOpps.reduce((s, o) => s + (o.metrics?.views || 0), 0);
  const offerRate = orgApps.length
    ? Math.round((orgApps.filter((a) => ["Offered", "Accepted"].includes(a.status)).length / orgApps.length) * 100)
    : 0;

  if (!hydrated) return null;

  return (
    <div className="space-y-8">
      <PageHeader title="Analytics" description="Opportunity performance, funnel, and co-funding utilization" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total views" value={totalViews.toLocaleString()} tone="teal" />
        <StatCard label="Applications" value={orgApps.length} tone="blue" />
        <StatCard label="Offer rate" value={`${offerRate}%`} tone="green" />
        <StatCard label="Co-funding utilization" value={`${utilPct}%`} hint={`${(cofundUtil.approved / 1000).toFixed(0)}k approved`} tone="violet" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Opportunity views & applications" summary="Per active role">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={viewsData}>
              <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} angle={-15} textAnchor="end" height={50} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="views" fill="#0d9488" name="Views" />
              <Bar dataKey="applications" fill="#6366f1" name="Applications" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Recruitment funnel" summary="Applications by pipeline stage">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={funnelData} layout="vertical">
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#0891b2" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Match quality distribution" summary="Algorithm scores for your opportunities">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={matchQuality} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {matchQuality.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Candidate skills" summary="Top skills among matched profiles">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={skillDist}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Co-funding trend" summary="Monthly request volume (simulated)">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={[
            { month: "Mar", amount: 120000 },
            { month: "Apr", amount: 180000 },
            { month: "May", amount: 95000 },
            { month: "Jun", amount: 220000 },
            { month: "Jul", amount: 360000 },
            { month: "Aug", amount: cofundUtil.requested || 72000 },
          ]}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(v) => [`${(v / 1000).toFixed(0)}k BDT`, "Requested"]} />
            <Line type="monotone" dataKey="amount" stroke="#0d9488" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
