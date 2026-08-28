"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
  Sparkles,
  FileText,
  Wallet,
  Bookmark,
  Bell,
  Compass,
  GraduationCap,
  Calendar,
} from "lucide-react";
import { PageHeader, StatCard, ChartCard, SectionHeader } from "@/components/ui";
import { Button, Badge } from "@/components/ui";
import {
  OpportunityCard,
  OpportunityCollection,
  ProfileCompletionCard,
  MatchScoreRing,
} from "@/components/domain/Domain";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { JOURNEY_STAGES } from "@/lib/constants";
import { formatDate, formatRelative } from "@/lib/formatters";
import { toast } from "sonner";
import {
  getStudentMatches,
  getStudentApplications,
  computePassportStrength,
  collectSkillGaps,
  matchDistribution,
  upcomingDeadlines,
} from "../_lib/helpers";

const CHART_COLORS = ["#0d9488", "#0891b2", "#6366f1", "#f59e0b", "#ef4444"];

export default function StudentDashboardPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const router = useRouter();
  const opportunities = useAppStore((s) => s.opportunities);
  const matches = useAppStore((s) => s.matches);
  const applications = useAppStore((s) => s.applications);
  const funding = useAppStore((s) => s.funding);
  const notifications = useAppStore((s) => s.notifications);
  const savedOpportunityIds = useAppStore((s) => s.savedOpportunityIds || []);
  const [view, setView] = useState("grid");
  const journeyStage = useAppStore((s) => s.journeyStage);
  const setJourneyStage = useAppStore((s) => s.setJourneyStage);

  const userMatches = useMemo(
    () => (user ? getStudentMatches(matches, user.id) : []),
    [matches, user]
  );
  const userApps = useMemo(
    () => (user ? getStudentApplications(applications, user.id) : []),
    [applications, user]
  );
  const userFunding = useMemo(
    () => funding.filter((f) => f.studentId === user?.id),
    [funding, user]
  );
  const userNotifs = useMemo(
    () => notifications.filter((n) => n.userId === user?.id).slice(0, 5),
    [notifications, user]
  );
  const chartData = useMemo(() => matchDistribution(userMatches), [userMatches]);
  const skillGaps = useMemo(() => collectSkillGaps(userMatches), [userMatches]);
  const deadlines = useMemo(
    () => upcomingDeadlines(opportunities, userMatches),
    [opportunities, userMatches]
  );
  const passportStrength = computePassportStrength(user);
  const topMatches = userMatches.slice(0, 3);
  const savedOpps = opportunities.filter((o) => savedOpportunityIds.includes(o.id)).slice(0, 3);

  const activeApps = userApps.filter((a) =>
    ["Submitted", "University review", "Shortlisted", "Interview scheduled", "In progress"].includes(a.status)
  ).length;
  const offerApps = userApps.filter((a) => ["Offered", "Accepted"].includes(a.status)).length;

  if (!hydrated) return null;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title={`${greeting()}, ${user?.name?.split(" ")[0] || "Student"}`}
        description={`${user?.programme || "Student"} · Year ${user?.currentYear || "—"} · ${JOURNEY_STAGES.find((s) => s.id === journeyStage)?.label || "Final year"}`}
        actions={
          <>
            <Button variant="secondary" onClick={() => router.push("/student/discover")}>Discover</Button>
            <Button onClick={() => router.push("/student/matches")}>View matches</Button>
          </>
        }
      />

      <section className="card-surface p-4">
        <SectionHeader
          title="Journey simulator"
          description="Preview how recommendations change across your academic journey"
        />
        <div className="flex flex-wrap gap-2">
          {JOURNEY_STAGES.map((stage) => (
            <Button
              key={stage.id}
              size="sm"
              variant={journeyStage === stage.id ? "primary" : "secondary"}
              onClick={() => {
                setJourneyStage(stage.id);
                toast.success(`Switched to ${stage.label} — matches recalculated`);
              }}
            >
              {stage.label}
            </Button>
          ))}
        </div>
        <p className="mt-3 text-sm text-secondary">
          Current stage affects eligibility scoring and match rankings. Top match score:{" "}
          <strong>{userMatches[0]?.overallScore ?? "—"}%</strong>
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active applications" value={activeApps} icon={<FileText className="h-5 w-5" />} tone="teal" />
        <StatCard label="Top match score" value={`${userMatches[0]?.overallScore ?? 0}%`} icon={<Sparkles className="h-5 w-5" />} tone="violet" />
        <StatCard label="Offers" value={offerApps} icon={<FileText className="h-5 w-5" />} tone="green" />
        <StatCard label="Passport strength" value={`${passportStrength}%`} hint="CV readiness score" icon={<Sparkles className="h-5 w-5" />} tone="blue" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <ProfileCompletionCard value={user?.profileCompletion || 0} href="/student/settings" />
        <div className="card-surface p-4 lg:col-span-2">
          <h3 className="font-semibold">Opportunity Passport strength</h3>
          <div className="mt-4 flex items-center gap-6">
            <MatchScoreRing score={passportStrength} size={80} />
            <div className="space-y-1 text-sm text-secondary">
              <p>{user?.skills?.length || 0} skills listed</p>
              <p>{user?.documents?.length || 0} documents uploaded</p>
              <p>{user?.certifications?.length || 0} certifications</p>
              <Button size="sm" variant="outline" onClick={() => router.push("/student/opportunity-passport")}>
                View passport
              </Button>
            </div>
          </div>
        </div>
      </div>

      <SectionHeader title="Top matches" actions={<Link href="/student/matches" className="text-sm text-nexus-700">See all</Link>} />
      <OpportunityCollection view={view} onViewChange={setView} count={topMatches.length} countLabel="top matches">
        {topMatches.map((m) => {
          const opp = opportunities.find((o) => o.id === m.opportunityId);
          if (!opp) return null;
          return <OpportunityCard key={m.id} opportunity={opp} matchScore={m.overallScore} view={view} />;
        })}
      </OpportunityCollection>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Match distribution" summary={`${userMatches.length} opportunities scored`}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="card-surface p-4">
          <h3 className="font-semibold">Application summary</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {userApps.slice(0, 5).map((app) => {
              const opp = opportunities.find((o) => o.id === app.opportunityId);
              return (
                <li key={app.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700">
                  <Link href={`/student/applications/${app.id}`} className="font-medium hover:text-nexus-700">
                    {opp?.title || app.id}
                  </Link>
                  <Badge tone="slate">{app.status}</Badge>
                </li>
              );
            })}
            {!userApps.length && <p className="text-secondary">No applications yet.</p>}
          </ul>
          <Button size="sm" variant="outline" className="mt-4" onClick={() => router.push("/student/applications")}>
            Manage applications
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card-surface p-4">
          <h3 className="font-semibold">Upcoming deadlines</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {deadlines.map((o) => (
              <li key={o.id} className="flex justify-between gap-2">
                <span className="line-clamp-1">{o.title}</span>
                <span className="shrink-0 text-secondary">{formatDate(o.deadline)}</span>
              </li>
            ))}
            {!deadlines.length && <p className="text-secondary">No upcoming deadlines.</p>}
          </ul>
        </div>

        <div className="card-surface p-4">
          <h3 className="font-semibold">Skill gaps</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {skillGaps.map(({ skill, count }) => (
              <li key={skill} className="flex justify-between">
                <span>{skill}</span>
                <Badge tone="amber">{count} matches</Badge>
              </li>
            ))}
            {!skillGaps.length && <p className="text-secondary">No gaps detected.</p>}
          </ul>
          <Button size="sm" variant="outline" className="mt-4" onClick={() => router.push("/student/skills")}>
            Improve skills
          </Button>
        </div>

        <div className="card-surface p-4">
          <h3 className="font-semibold">Funding status</h3>
          {userFunding.length ? (
            userFunding.map((f) => (
              <div key={f.id} className="mt-3 text-sm">
                <p className="font-medium">{f.programme || "Funding request"}</p>
                <Badge tone="teal" className="mt-1">{f.status}</Badge>
                <p className="mt-1 text-secondary">{f.milestones?.filter((m) => m.status === "Paid").length || 0} of {f.milestones?.length || 0} milestones paid</p>
              </div>
            ))
          ) : (
            <p className="mt-3 text-sm text-secondary">No funding requests yet.</p>
          )}
          <Button size="sm" variant="outline" className="mt-4" onClick={() => router.push("/student/funding")}>
            Request funding
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-surface p-4">
          <SectionHeader title="Saved opportunities" actions={<Link href="/student/saved" className="text-sm text-nexus-700">View all</Link>} />
          <div className="mt-3 flex flex-col gap-6">
            {savedOpps.map((o) => (
              <OpportunityCard key={o.id} opportunity={o} matchScore={userMatches.find((m) => m.opportunityId === o.id)?.overallScore} view="list" />
            ))}
            {!savedOpps.length && <p className="text-sm text-secondary">Nothing saved yet.</p>}
          </div>
        </div>

        <div className="card-surface p-4">
          <SectionHeader title="Notifications" actions={<Link href="/student/notifications" className="text-sm text-nexus-700">View all</Link>} />
          <ul className="space-y-3">
            {userNotifs.map((n) => (
              <li key={n.id} className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700">
                <p className="font-medium">{n.title}</p>
                <p className="text-secondary">{n.body}</p>
                <p className="mt-1 text-xs text-secondary">{formatRelative(n.createdAt)}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card-surface p-4">
        <h3 className="font-semibold">Quick actions</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => router.push("/student/discover")}><Compass className="h-4 w-4" />Discover</Button>
          <Button size="sm" variant="secondary" onClick={() => router.push("/student/applications")}><FileText className="h-4 w-4" />Applications</Button>
          <Button size="sm" variant="secondary" onClick={() => router.push("/student/courses")}><GraduationCap className="h-4 w-4" />Courses</Button>
          <Button size="sm" variant="secondary" onClick={() => router.push("/student/calendar")}><Calendar className="h-4 w-4" />Calendar</Button>
          <Button size="sm" variant="secondary" onClick={() => router.push("/student/finance")}><Wallet className="h-4 w-4" />Finance</Button>
          <Button size="sm" variant="secondary" onClick={() => router.push("/student/saved")}><Bookmark className="h-4 w-4" />Saved</Button>
          <Button size="sm" variant="secondary" onClick={() => router.push("/student/notifications")}><Bell className="h-4 w-4" />Notifications</Button>
        </div>
      </div>
    </div>
  );
}
