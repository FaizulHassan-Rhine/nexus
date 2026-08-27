"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Briefcase,
  Users,
  Sparkles,
  FileText,
  Calendar,
  BadgeCheck,
  Wallet,
  AlertTriangle,
  Building2,
  Handshake,
} from "lucide-react";
import { PageHeader, StatCard, ChartCard, SectionHeader } from "@/components/ui";
import { Button, Badge, StatusBadge } from "@/components/ui";
import { MatchScoreRing } from "@/components/domain/Domain";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { formatDate, formatRelative } from "@/lib/formatters";
import {
  getOrg,
  getOrgOpportunities,
  getOrgApplications,
  getOrgMatches,
  getOrgFunding,
  getPartnerUniversities,
  applicationsByStage,
} from "../_lib/helpers";

const CHART_COLORS = ["#0d9488", "#0891b2", "#6366f1", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6", "#64748b"];

export default function OrganizationDashboardPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const router = useRouter();
  const organizations = useAppStore((s) => s.organizations);
  const opportunities = useAppStore((s) => s.opportunities);
  const applications = useAppStore((s) => s.applications);
  const matches = useAppStore((s) => s.matches);
  const funding = useAppStore((s) => s.funding);
  const universities = useAppStore((s) => s.universities);
  const notifications = useAppStore((s) => s.notifications);

  const org = useMemo(() => getOrg(organizations, user?.organizationId), [organizations, user]);
  const orgOpps = useMemo(() => getOrgOpportunities(opportunities, user?.organizationId), [opportunities, user]);
  const orgApps = useMemo(
    () => getOrgApplications(applications, opportunities, user?.organizationId),
    [applications, opportunities, user]
  );
  const orgMatches = useMemo(
    () => getOrgMatches(matches, opportunities, user?.organizationId).sort((a, b) => (b.overallScore || 0) - (a.overallScore || 0)),
    [matches, opportunities, user]
  );
  const orgFunding = useMemo(() => getOrgFunding(funding, user?.organizationId), [funding, user]);
  const partners = useMemo(() => getPartnerUniversities(universities, org), [universities, org]);

  const activeOpps = orgOpps.filter((o) => o.status === "Published" || o.status === "Open" || !o.status).length;
  const interviews = orgApps.filter((a) => a.status === "Interview scheduled").length;
  const offers = orgApps.filter((a) => ["Offered", "Accepted"].includes(a.status)).length;
  const pendingFunding = orgFunding.filter((f) => !["Approved", "Paid", "Rejected"].includes(f.status)).length;
  const stageData = useMemo(() => {
    const stages = applicationsByStage(orgApps);
    return Object.entries(stages).map(([name, count]) => ({ name, count }));
  }, [orgApps]);
  const deadlines = orgOpps
    .filter((o) => o.deadline && new Date(o.deadline) > new Date())
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 5);
  const riskAlerts = useMemo(() => {
    const alerts = [];
    if (org?.riskLevel === "Medium" || org?.riskLevel === "High") {
      alerts.push({ id: "risk", text: `Organization risk level: ${org.riskLevel}`, tone: "amber" });
    }
    if (org?.complaintCount > 2) {
      alerts.push({ id: "complaints", text: `${org.complaintCount} complaints on record — review compliance`, tone: "red" });
    }
    orgOpps.filter((o) => o.verificationStatus === "Pending").forEach((o) => {
      alerts.push({ id: o.id, text: `"${o.title}" pending verification`, tone: "amber" });
    });
    return alerts;
  }, [org, orgOpps]);
  const userNotifs = notifications.filter((n) => n.userId === user?.id).slice(0, 4);

  if (!hydrated) return null;

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome, ${user?.name?.split(" ")[0] || "Partner"}`}
        description={`${org?.name || "Organization"} · ${org?.verificationStatus || "Pending"} · ${user?.designation || "Recruiter"}`}
        actions={
          <>
            <Button variant="secondary" onClick={() => router.push("/organization/opportunities")}>Manage opportunities</Button>
            <Button onClick={() => router.push("/organization/opportunities/new")}>Post opportunity</Button>
          </>
        }
      />

      <section className="card-surface p-4">
        <SectionHeader title="Verification & compliance" description="Organization trust status on Nexus" />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Badge tone={org?.verificationStatus === "Verified" ? "green" : "amber"}>{org?.verificationStatus || "Pending"}</Badge>
          <Badge tone={org?.riskLevel === "Low" ? "green" : org?.riskLevel === "Medium" ? "amber" : "red"}>
            Risk: {org?.riskLevel || "—"}
          </Badge>
          {org?.ugcCoFundingEligible ? <Badge tone="violet">UGC co-funding eligible</Badge> : null}
          <span className="text-sm text-secondary">Rating {org?.rating ?? "—"} · {org?.publishedOpportunityCount ?? 0} published roles</span>
        </div>
      </section>

      {riskAlerts.length ? (
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
          <div className="flex items-center gap-2 font-semibold text-amber-900 dark:text-amber-100">
            <AlertTriangle className="h-4 w-4" />
            Risk & compliance alerts
          </div>
          <ul className="mt-2 space-y-1 text-sm text-amber-800 dark:text-amber-200">
            {riskAlerts.map((a) => (
              <li key={a.id}>• {a.text}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active opportunities" value={activeOpps} icon={<Briefcase className="h-5 w-5" />} tone="teal" />
        <StatCard label="Candidate matches" value={orgMatches.length} icon={<Sparkles className="h-5 w-5" />} tone="violet" />
        <StatCard label="Applications" value={orgApps.length} icon={<FileText className="h-5 w-5" />} tone="blue" />
        <StatCard label="Interviews scheduled" value={interviews} icon={<Calendar className="h-5 w-5" />} tone="green" />
        <StatCard label="Offers" value={offers} icon={<BadgeCheck className="h-5 w-5" />} tone="green" />
        <StatCard label="Co-funding requests" value={orgFunding.length} hint={`${pendingFunding} pending`} icon={<Wallet className="h-5 w-5" />} tone="violet" />
        <StatCard label="Partner universities" value={partners.length} icon={<Handshake className="h-5 w-5" />} tone="blue" />
        <StatCard
          label="Intern conversion"
          value={`${Math.round((org?.pastHiringMetrics?.conversionRate || 0) * 100)}%`}
          hint={`${org?.pastHiringMetrics?.internsHired || 0} interns hired`}
          icon={<Users className="h-5 w-5" />}
          tone="teal"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Applications by stage" summary="Recruitment funnel for your opportunities">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stageData}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {stageData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="card-surface p-4">
          <SectionHeader title="Top candidate matches" description="Highest-scoring profiles for your roles" />
          <ul className="mt-4 space-y-3">
            {orgMatches.slice(0, 5).map((m) => {
              const opp = orgOpps.find((o) => o.id === m.opportunityId);
              return (
                <li key={m.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{opp?.title || m.opportunityId}</p>
                    <p className="text-xs text-secondary">Match {m.overallScore}%</p>
                  </div>
                  <MatchScoreRing score={m.overallScore || 0} size={48} />
                </li>
              );
            })}
            {!orgMatches.length && <p className="text-sm text-secondary">No matches yet — publish opportunities to attract candidates.</p>}
          </ul>
          <Button className="mt-4" variant="secondary" size="sm" onClick={() => router.push("/organization/candidates")}>
            Browse candidates
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-surface p-4">
          <SectionHeader title="Upcoming deadlines" />
          <ul className="mt-3 space-y-2">
            {deadlines.map((o) => (
              <li key={o.id} className="flex items-center justify-between text-sm">
                <Link href={`/organization/opportunities/${o.id}`} className="font-medium hover:text-nexus-700">
                  {o.title}
                </Link>
                <span className="text-secondary">{formatDate(o.deadline)}</span>
              </li>
            ))}
            {!deadlines.length && <p className="text-sm text-secondary">No upcoming deadlines.</p>}
          </ul>
        </div>

        <div className="card-surface p-4">
          <SectionHeader title="University partnerships" />
          <ul className="mt-3 space-y-2">
            {partners.slice(0, 5).map((u) => (
              <li key={u.id} className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-nexus-600" />
                <span>{u.name}</span>
                <Badge tone="slate">{u.type || "University"}</Badge>
              </li>
            ))}
          </ul>
          <Button className="mt-4" variant="ghost" size="sm" onClick={() => router.push("/organization/partnerships")}>
            Manage partnerships
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-surface p-4">
          <SectionHeader title="Recent applications" />
          <ul className="mt-3 divide-y divide-slate-200 dark:divide-slate-700">
            {orgApps.slice(0, 5).map((app) => {
              const opp = orgOpps.find((o) => o.id === app.opportunityId);
              return (
                <li key={app.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <p className="font-medium">{opp?.title || app.opportunityId}</p>
                    <p className="text-xs text-secondary">{formatRelative(app.updatedAt || app.submittedAt)}</p>
                  </div>
                  <StatusBadge status={app.status} />
                </li>
              );
            })}
          </ul>
          <Button className="mt-3" variant="secondary" size="sm" onClick={() => router.push("/organization/pipeline")}>
            Open pipeline
          </Button>
        </div>

        <div className="card-surface p-4">
          <SectionHeader title="Notifications" />
          <ul className="mt-3 space-y-2">
            {userNotifs.map((n) => (
              <li key={n.id} className="text-sm">
                <p className="font-medium">{n.title}</p>
                <p className="text-xs text-secondary">{formatRelative(n.createdAt)}</p>
              </li>
            ))}
            {!userNotifs.length && <p className="text-sm text-secondary">No recent notifications.</p>}
          </ul>
        </div>
      </div>
    </div>
  );
}
