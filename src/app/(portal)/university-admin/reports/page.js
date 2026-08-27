"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from "recharts";
import { PageHeader, ChartCard, StatCard, Button } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { downloadCsv } from "@/lib/exporters";
import { toast } from "sonner";
import { getUniversityId, universityStudents, collectSkillGaps, activeInternships } from "../_lib/helpers";

const COLORS = ["#0d9488", "#6366f1", "#f59e0b", "#0891b2"];

export default function ReportsPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const uniId = getUniversityId(user);
  const users = useAppStore((s) => s.users);
  const applications = useAppStore((s) => s.applications);
  const matches = useAppStore((s) => s.matches);
  const funding = useAppStore((s) => s.funding);
  const opportunities = useAppStore((s) => s.opportunities);

  const students = universityStudents(users, uniId);
  const internships = activeInternships(applications, opportunities, users, uniId);
  const skillGaps = collectSkillGaps(matches, users, uniId);
  const deptData = useMemo(() => {
    const counts = {};
    students.forEach((s) => { counts[s.department || "Other"] = (counts[s.department || "Other"] || 0) + 1; });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [students]);

  const monthlyApps = [
    { month: "May", count: 12 },
    { month: "Jun", count: 18 },
    { month: "Jul", count: 24 },
    { month: "Aug", count: applications.filter((a) => users.find((u) => u.id === a.applicantId)?.universityId === uniId).length },
  ];

  const exportCsv = () => {
    downloadCsv(
      "university-report",
      students.map((s) => ({
        name: s.name,
        department: s.department,
        programme: s.programme,
        verification: s.verificationStatus,
        profile: s.profileCompletion,
      })),
      [
        { key: "name", label: "Name" },
        { key: "department", label: "Department" },
        { key: "programme", label: "Programme" },
        { key: "verification", label: "Verification" },
        { key: "profile", label: "Profile %" },
      ]
    );
    toast.success("CSV exported");
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-8">
      <PageHeader title="Reports" description="Analytics and exports for university leadership" actions={<Button onClick={exportCsv}>Export CSV</Button>} />
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Students on Nexus" value={students.length} tone="teal" />
        <StatCard label="Active internships" value={internships.length} tone="green" />
        <StatCard label="Funding requests" value={funding.filter((f) => f.universityId === uniId).length} tone="blue" />
        <StatCard label="Top skill gap" value={skillGaps[0]?.skill || "—"} tone="amber" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Students by department">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={deptData}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count">{deptData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Applications trend">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyApps}>
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#0d9488" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
