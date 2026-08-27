"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { ClipboardCheck, Users, Wallet, Scale, AlertTriangle, Handshake, GraduationCap } from "lucide-react";
import { PageHeader, StatCard, ChartCard, SectionHeader, Badge, Button } from "@/components/ui";
import { SlaBadge } from "@/components/domain/Domain";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import {
  getUniversityId,
  buildReviewQueue,
  pendingVerifications,
  pendingMatches,
  activeInternships,
  collectSkillGaps,
  universityDisputes,
} from "../_lib/helpers";

const COLORS = ["#0d9488", "#6366f1", "#f59e0b", "#ef4444", "#0891b2"];

export default function UniversityDashboardPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const router = useRouter();
  const uniId = getUniversityId(user);
  const users = useAppStore((s) => s.users);
  const matches = useAppStore((s) => s.matches);
  const applications = useAppStore((s) => s.applications);
  const opportunities = useAppStore((s) => s.opportunities);
  const funding = useAppStore((s) => s.funding);
  const disputes = useAppStore((s) => s.disputes);
  const tickets = useAppStore((s) => s.tickets);
  const organizations = useAppStore((s) => s.organizations);
  const universities = useAppStore((s) => s.universities);

  const technologies = useAppStore((s) => s.technologies);
  const scholarships = useAppStore((s) => s.scholarships);

  const queue = useMemo(
    () => buildReviewQueue({ users, matches, applications, opportunities, funding, technologies, scholarships }, uniId),
    [users, matches, applications, opportunities, funding, technologies, scholarships, uniId]
  );

  const verifications = pendingVerifications(users, uniId);
  const matchReviews = pendingMatches(matches, users, uniId);
  const internships = activeInternships(applications, opportunities, users, uniId);
  const fundingQueue = funding.filter((f) => f.universityId === uniId && ["University verification", "Submitted"].includes(f.status));
  const openDisputes = universityDisputes(disputes, uniId);
  const safetyAlerts = openDisputes.filter((d) => String(d.issueType).toLowerCase().includes("safe"));
  const skillGaps = collectSkillGaps(matches, users, uniId);
  const uni = universities.find((u) => u.id === uniId);
  const partnerOrgs = organizations.filter((o) => o.partnerUniversities?.includes(uniId) || o.universityPartnerships?.includes(uniId)).slice(0, 6);
  const slaTickets = tickets.filter((t) => t.assignedTo === user?.id || t.requesterId === user?.id).slice(0, 3);

  const placementData = useMemo(() => {
    const statuses = ["Accepted", "In progress", "Completed", "Interview scheduled"];
    return statuses.map((s) => ({
      name: s.replace("Interview scheduled", "Interview"),
      count: applications.filter((a) => {
        const applicant = users.find((u) => u.id === a.applicantId);
        return applicant?.universityId === uniId && a.status === s;
      }).length,
    }));
  }, [applications, users, uniId]);

  if (!hydrated) return null;

  return (
    <div className="space-y-8">
      <PageHeader
        title={`${uni?.shortName || "University"} admin dashboard`}
        description={`${user?.name} · ${user?.designation || "Administrator"} — monitor reviews, placements, and compliance`}
        actions={
          <>
            <Button variant="secondary" onClick={() => router.push("/university-admin/review-queue")}>Review queue ({queue.length})</Button>
            <Button onClick={() => router.push("/university-admin/reports")}>Reports</Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Pending verifications" value={verifications.length} icon={<Users className="h-5 w-5" />} tone="amber" />
        <StatCard label="Match reviews" value={matchReviews.length} icon={<ClipboardCheck className="h-5 w-5" />} tone="violet" />
        <StatCard label="Internship approvals" value={queue.filter((q) => q.type === "internship").length} icon={<GraduationCap className="h-5 w-5" />} tone="teal" />
        <StatCard label="Funding queue" value={fundingQueue.length} icon={<Wallet className="h-5 w-5" />} tone="blue" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Safety alerts" value={safetyAlerts.length} hint="Open safety disputes" icon={<AlertTriangle className="h-5 w-5" />} tone="red" />
        <StatCard label="Active disputes" value={openDisputes.length} icon={<Scale className="h-5 w-5" />} tone="amber" />
        <StatCard label="Confirmed internships" value={internships.length} icon={<GraduationCap className="h-5 w-5" />} tone="green" />
        <StatCard label="Partners" value={uni?.activePartnerships || partnerOrgs.length} icon={<Handshake className="h-5 w-5" />} tone="violet" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Placements by stage" summary="Applications from your students">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={placementData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {placementData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="card-surface p-4">
          <SectionHeader title="Review queue priority" actions={<Link href="/university-admin/review-queue" className="text-sm text-nexus-700">Open queue</Link>} />
          <ul className="space-y-2 text-sm">
            {queue.slice(0, 6).map((item) => (
              <li key={item.key} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700">
                <Link href={`/university-admin/review-queue/${encodeURIComponent(item.key)}`} className="font-medium hover:text-nexus-700">
                  {item.title}
                </Link>
                <Badge tone={item.priority === "High" ? "red" : item.priority === "Medium" ? "amber" : "slate"}>{item.priority}</Badge>
              </li>
            ))}
            {!queue.length && <p className="text-secondary">Queue is clear.</p>}
          </ul>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card-surface p-4">
          <h3 className="font-semibold">Skill gaps (campus-wide)</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {skillGaps.map(({ skill, count }) => (
              <li key={skill} className="flex justify-between">
                <span>{skill}</span>
                <Badge tone="amber">{count} matches</Badge>
              </li>
            ))}
            {!skillGaps.length && <p className="text-secondary">No gaps detected.</p>}
          </ul>
        </div>

        <div className="card-surface p-4">
          <h3 className="font-semibold">SLA & support</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {slaTickets.map((t) => (
              <li key={t.id} className="flex items-center justify-between rounded-lg border px-3 py-2 dark:border-slate-700">
                <span className="line-clamp-1">{t.subject}</span>
                <SlaBadge deadline={t.slaDeadline} />
              </li>
            ))}
            {!slaTickets.length && <p className="text-secondary">No linked tickets.</p>}
          </ul>
          <Button size="sm" variant="outline" className="mt-4" onClick={() => router.push("/university-admin/support")}>Support</Button>
        </div>

        <div className="card-surface p-4">
          <h3 className="font-semibold">Key partners</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {(partnerOrgs.length ? partnerOrgs : organizations.filter((o) => o.verificationStatus === "Verified").slice(0, 5)).map((o) => (
              <li key={o.id} className="flex justify-between">
                <span>{o.name}</span>
                <Badge tone="green">{o.verificationStatus || "Active"}</Badge>
              </li>
            ))}
          </ul>
          <Button size="sm" variant="outline" className="mt-4" onClick={() => router.push("/university-admin/partnerships")}>Partnerships</Button>
        </div>
      </div>

      {openDisputes.length ? (
        <div className="card-surface p-4">
          <SectionHeader title="Disputes requiring mediation" actions={<Link href="/university-admin/disputes" className="text-sm text-nexus-700">Manage disputes</Link>} />
          <ul className="space-y-2 text-sm">
            {openDisputes.slice(0, 4).map((d) => (
              <li key={d.id} className="flex items-center justify-between rounded-lg border px-3 py-2 dark:border-slate-700">
                <span>{d.issueType} — {d.id}</span>
                <Badge tone="amber">{d.status}</Badge>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
