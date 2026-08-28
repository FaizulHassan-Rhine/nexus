"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import {
  Sparkles,
  FileText,
  FlaskConical,
  Handshake,
  GraduationCap,
  Cpu,
  Banknote,
  MessageSquare,
  Globe2,
} from "lucide-react";
import { PageHeader, StatCard, ChartCard, SectionHeader } from "@/components/ui";
import { Button, Badge } from "@/components/ui";
import { OpportunityCard, OpportunityCollection, ProfileCompletionCard, MatchScoreRing } from "@/components/domain/Domain";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { formatDate, formatRelative } from "@/lib/formatters";
import {
  getFacultyMatches,
  getFacultyApplications,
  getFacultyProjects,
  getFacultyTechnologies,
  getSupervisedStudents,
  grantDeadlines,
  matchDistribution,
  filterFacultyOpportunities,
  getConversationParticipants,
} from "../_lib/helpers";

const CHART_COLORS = ["#0d9488", "#0891b2", "#6366f1", "#f59e0b", "#ef4444"];

export default function FacultyDashboardPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const router = useRouter();
  const [view, setView] = useState("grid");
  const opportunities = useAppStore((s) => s.opportunities);
  const matches = useAppStore((s) => s.matches);
  const applications = useAppStore((s) => s.applications);
  const projects = useAppStore((s) => s.projects);
  const technologies = useAppStore((s) => s.technologies);
  const notifications = useAppStore((s) => s.notifications);
  const conversations = useAppStore((s) => s.conversations);
  const users = useAppStore((s) => s.users);

  const userMatches = useMemo(
    () => (user ? getFacultyMatches(matches, user.id) : []),
    [matches, user]
  );
  const userApps = useMemo(
    () => (user ? getFacultyApplications(applications, user.id) : []),
    [applications, user]
  );
  const activeProjects = useMemo(
    () => (user ? getFacultyProjects(projects, user.id).filter((p) => p.status === "Active") : []),
    [projects, user]
  );
  const myTech = useMemo(
    () => (user ? getFacultyTechnologies(technologies, user.id) : []),
    [technologies, user]
  );
  const students = useMemo(
    () => (user ? getSupervisedStudents(projects, users, user.id) : []),
    [projects, users, user]
  );
  const userNotifs = useMemo(
    () => notifications.filter((n) => n.userId === user?.id).slice(0, 5),
    [notifications, user]
  );
  const chartData = useMemo(() => matchDistribution(userMatches), [userMatches]);
  const deadlines = useMemo(
    () => grantDeadlines(opportunities, userMatches),
    [opportunities, userMatches]
  );
  const collaborations = useMemo(
    () => filterFacultyOpportunities(opportunities, { category: "research" }).slice(0, 3),
    [opportunities]
  );
  const exchangeCalls = useMemo(
    () => filterFacultyOpportunities(opportunities, { category: "exchange" }),
    [opportunities]
  );
  const consultancyOpps = useMemo(
    () => filterFacultyOpportunities(opportunities, { category: "consultancy" }),
    [opportunities]
  );
  const myConversations = useMemo(
    () =>
      conversations
        .filter((c) => getConversationParticipants(c).includes(user?.id))
        .slice(0, 3),
    [conversations, user]
  );

  const activeApps = userApps.filter((a) =>
    ["Submitted", "University review", "Shortlisted", "In progress", "University approved", "Sent to organization"].includes(a.status)
  ).length;
  const topScore = userMatches.find((m) => m.overallScore)?.overallScore ?? 0;

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
        title={`${greeting()}, ${user?.name?.split(" ").slice(-1)[0] || "Professor"}`}
        description={`${user?.designation || "Faculty"} · ${user?.department || "Department"} · ${user?.universityId?.toUpperCase() || "University"}`}
        actions={
          <>
            <Button variant="secondary" onClick={() => router.push("/faculty/opportunities")}>Discover</Button>
            <Button onClick={() => router.push("/faculty/applications")}>Applications</Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active applications" value={activeApps} icon={<FileText className="h-5 w-5" />} tone="teal" />
        <StatCard label="Top match score" value={topScore ? `${topScore}%` : "—"} icon={<Sparkles className="h-5 w-5" />} tone="violet" />
        <StatCard label="Active research" value={activeProjects.length} icon={<FlaskConical className="h-5 w-5" />} tone="blue" />
        <StatCard label="Technologies" value={myTech.length} icon={<Cpu className="h-5 w-5" />} tone="green" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <ProfileCompletionCard value={user?.profileCompletion || 0} href="/faculty/profile" />
        <div className="card-surface p-4 lg:col-span-2">
          <h3 className="font-semibold">Research profile snapshot</h3>
          <div className="mt-4 flex flex-wrap items-center gap-6">
            <MatchScoreRing score={user?.profileCompletion || 0} size={80} />
            <div className="space-y-1 text-sm text-secondary">
              <p>{user?.researchAreas?.length || 0} research areas</p>
              <p>{user?.publications?.length || 0} publications</p>
              <p>{user?.patents?.length || 0} patents filed</p>
              <Button size="sm" variant="outline" onClick={() => router.push("/faculty/profile")}>
                Edit profile
              </Button>
            </div>
          </div>
        </div>
      </div>

      <SectionHeader title="Recommended collaborations" actions={<Link href="/faculty/research" className="text-sm text-nexus-700">Research board</Link>} />
      <OpportunityCollection view={view} onViewChange={setView} count={collaborations.length} countLabel="collaborations">
        {collaborations.map((o) => {
          const match = userMatches.find((m) => m.opportunityId === o.id);
          return <OpportunityCard key={o.id} opportunity={o} matchScore={match?.overallScore} view={view} />;
        })}
        {!collaborations.length && <p className="text-sm text-secondary">No collaboration matches yet.</p>}
      </OpportunityCollection>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-surface p-4">
          <SectionHeader title="Exchange calls" actions={<Link href="/faculty/exchange" className="text-sm text-nexus-700">View all</Link>} />
          <ul className="mt-3 space-y-2 text-sm">
            {exchangeCalls.slice(0, 4).map((o) => (
              <li key={o.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700">
                <span className="line-clamp-1 font-medium">{o.title}</span>
                <Badge tone="teal">{formatDate(o.deadline)}</Badge>
              </li>
            ))}
            {!exchangeCalls.length && <p className="text-secondary">No exchange programmes open.</p>}
          </ul>
        </div>

        <div className="card-surface p-4">
          <SectionHeader title="Consultancy invitations" actions={<Link href="/faculty/consultancy" className="text-sm text-nexus-700">Marketplace</Link>} />
          <ul className="mt-3 space-y-2 text-sm">
            {consultancyOpps.map((o) => (
              <li key={o.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700">
                <span className="line-clamp-1">{o.title}</span>
                <Badge tone="violet">Open</Badge>
              </li>
            ))}
            {!consultancyOpps.length && <p className="text-secondary">No consultancy openings.</p>}
          </ul>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card-surface p-4">
          <h3 className="font-semibold">Active research</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {activeProjects.slice(0, 4).map((p) => (
              <li key={p.id} className="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700">
                <p className="font-medium">{p.title}</p>
                <p className="text-secondary">{p.status} · ends {formatDate(p.endDate)}</p>
              </li>
            ))}
            {!activeProjects.length && <p className="text-secondary">No active projects.</p>}
          </ul>
          <Button size="sm" variant="outline" className="mt-4" onClick={() => router.push("/faculty/research")}>
            Collaboration board
          </Button>
        </div>

        <div className="card-surface p-4">
          <h3 className="font-semibold">Supervised students</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {students.slice(0, 4).map((s) => (
              <li key={s.id} className="flex justify-between rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700">
                <span className="font-medium">{s.name}</span>
                <Badge tone="slate">{s.programme || "Student"}</Badge>
              </li>
            ))}
            {!students.length && <p className="text-secondary">No supervised students linked.</p>}
          </ul>
          <Button size="sm" variant="outline" className="mt-4" onClick={() => router.push("/faculty/students")}>
            Manage students
          </Button>
        </div>

        <div className="card-surface p-4">
          <h3 className="font-semibold">Technology interest</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {myTech.slice(0, 4).map((t) => (
              <li key={t.id} className="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700">
                <p className="font-medium">{t.title}</p>
                <Badge tone="teal" className="mt-1">{t.status}</Badge>
              </li>
            ))}
            {!myTech.length && <p className="text-secondary">No technologies listed.</p>}
          </ul>
          <Button size="sm" variant="outline" className="mt-4" onClick={() => router.push("/faculty/technology-transfer")}>
            Technology transfer
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Match distribution" summary={`${userMatches.length} faculty opportunities scored`}>
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
          <h3 className="font-semibold">Grant deadlines</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {deadlines.map((o) => (
              <li key={o.id} className="flex justify-between gap-2">
                <span className="line-clamp-1">{o.title}</span>
                <span className="shrink-0 text-secondary">{formatDate(o.deadline)}</span>
              </li>
            ))}
            {!deadlines.length && <p className="text-secondary">No upcoming grant deadlines.</p>}
          </ul>
          <Button size="sm" variant="outline" className="mt-4" onClick={() => router.push("/faculty/grants")}>
            Grant calls
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-surface p-4">
          <SectionHeader title="Recent messages" actions={<Link href="/faculty/messages" className="text-sm text-nexus-700">Inbox</Link>} />
          <ul className="space-y-3">
            {myConversations.map((c) => {
              const last = c.messages?.[c.messages.length - 1];
              return (
                <li key={c.id} className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700">
                  <p className="font-medium">{c.subject}</p>
                  <p className="line-clamp-1 text-secondary">{last?.body}</p>
                </li>
              );
            })}
            {!myConversations.length && <p className="text-sm text-secondary">No recent messages.</p>}
          </ul>
        </div>

        <div className="card-surface p-4">
          <SectionHeader title="Notifications" actions={<Link href="/faculty/notifications" className="text-sm text-nexus-700">View all</Link>} />
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
          <Button size="sm" variant="secondary" onClick={() => router.push("/faculty/opportunities")}><Sparkles className="h-4 w-4" />Opportunities</Button>
          <Button size="sm" variant="secondary" onClick={() => router.push("/faculty/exchange")}><Globe2 className="h-4 w-4" />Exchange</Button>
          <Button size="sm" variant="secondary" onClick={() => router.push("/faculty/grants")}><Banknote className="h-4 w-4" />Grants</Button>
          <Button size="sm" variant="secondary" onClick={() => router.push("/faculty/consultancy")}><Handshake className="h-4 w-4" />Consultancy</Button>
          <Button size="sm" variant="secondary" onClick={() => router.push("/faculty/technologies/new")}><Cpu className="h-4 w-4" />New technology</Button>
          <Button size="sm" variant="secondary" onClick={() => router.push("/faculty/mentoring")}><GraduationCap className="h-4 w-4" />Mentoring</Button>
          <Button size="sm" variant="secondary" onClick={() => router.push("/faculty/messages")}><MessageSquare className="h-4 w-4" />Messages</Button>
        </div>
      </div>
    </div>
  );
}
