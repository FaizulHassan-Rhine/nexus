"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  FileText,
  FlaskConical,
  Handshake,
  Database,
  Banknote,
  MessageSquare,
} from "lucide-react";
import { PageHeader, StatCard, SectionHeader } from "@/components/ui";
import { Button, Badge } from "@/components/ui";
import { OpportunityCard, ProfileCompletionCard, MatchScoreRing } from "@/components/domain/Domain";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { formatDate, formatRelative } from "@/lib/formatters";
import {
  getResearcherMatches,
  getResearcherApplications,
  getResearcherProjects,
  getResearcherTechnologies,
  getResearcherDatasets,
  getResearcherCollaborations,
  grantDeadlines,
  filterResearcherOpportunities,
  getConversationParticipants,
} from "../_lib/helpers";

export default function ResearcherDashboardPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const router = useRouter();
  const opportunities = useAppStore((s) => s.opportunities);
  const matches = useAppStore((s) => s.matches);
  const applications = useAppStore((s) => s.applications);
  const projects = useAppStore((s) => s.projects);
  const technologies = useAppStore((s) => s.technologies);
  const notifications = useAppStore((s) => s.notifications);
  const conversations = useAppStore((s) => s.conversations);

  const userMatches = useMemo(
    () => (user ? getResearcherMatches(matches, user.id) : []),
    [matches, user]
  );
  const userApps = useMemo(
    () => (user ? getResearcherApplications(applications, user.id) : []),
    [applications, user]
  );
  const myProjects = useMemo(
    () => (user ? getResearcherProjects(projects, user.id, user) : []),
    [projects, user]
  );
  const activeProjects = useMemo(
    () => myProjects.filter((p) => p.status === "Active"),
    [myProjects]
  );
  const myTech = useMemo(
    () => (user ? getResearcherTechnologies(technologies, user.id) : []),
    [technologies, user]
  );
  const myDatasets = useMemo(
    () => (user ? getResearcherDatasets(user, projects) : []),
    [user, projects]
  );
  const { active: activeCollabs, pending: pendingCollabs } = useMemo(
    () => (user ? getResearcherCollaborations(matches, opportunities, applications, user.id) : { active: [], pending: [] }),
    [matches, opportunities, applications, user]
  );
  const userNotifs = useMemo(
    () => notifications.filter((n) => n.userId === user?.id).slice(0, 5),
    [notifications, user]
  );
  const deadlines = useMemo(
    () => grantDeadlines(opportunities, userMatches),
    [opportunities, userMatches]
  );
  const topMatches = useMemo(() => {
    const matchedOpps = userMatches
      .map((m) => ({ match: m, opp: opportunities.find((o) => o.id === m.opportunityId) }))
      .filter((x) => x.opp);
    return matchedOpps.slice(0, 3);
  }, [userMatches, opportunities]);
  const collaborationOpps = useMemo(
    () => filterResearcherOpportunities(opportunities, { category: "collaboration" }).slice(0, 3),
    [opportunities]
  );
  const myConversations = useMemo(
    () =>
      conversations
        .filter((c) => getConversationParticipants(c).includes(user?.id))
        .slice(0, 3),
    [conversations, user]
  );
  const recentApps = useMemo(
    () =>
      [...userApps]
        .sort((a, b) => new Date(b.updatedAt || b.submittedAt || 0) - new Date(a.updatedAt || a.submittedAt || 0))
        .slice(0, 4),
    [userApps]
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
        title={`${greeting()}, ${user?.name?.split(" ").slice(-1)[0] || "Researcher"}`}
        description={`${user?.affiliationType || "Researcher"} · ${user?.department || "Research"} · ORCID ${user?.orcid || "—"}`}
        actions={
          <>
            <Button variant="secondary" onClick={() => router.push("/researcher/opportunities")}>Discover</Button>
            <Button onClick={() => router.push("/researcher/applications")}>Applications</Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active applications" value={activeApps} icon={<FileText className="h-5 w-5" />} tone="teal" />
        <StatCard label="Top match score" value={topScore ? `${topScore}%` : userMatches.length ? "Review" : "—"} icon={<Sparkles className="h-5 w-5" />} tone="violet" />
        <StatCard label="Active projects" value={activeProjects.length} icon={<FlaskConical className="h-5 w-5" />} tone="blue" />
        <StatCard label="Datasets published" value={myDatasets.length} icon={<Database className="h-5 w-5" />} tone="green" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <ProfileCompletionCard value={user?.profileCompletion || 0} href="/researcher/profile" />
        <div className="card-surface p-4 lg:col-span-2">
          <h3 className="font-semibold">Research profile snapshot</h3>
          <div className="mt-4 flex flex-wrap items-center gap-6">
            <MatchScoreRing score={user?.profileCompletion || 0} size={80} />
            <div className="space-y-1 text-sm text-secondary">
              <p>{user?.researchAreas?.length || 0} research areas</p>
              <p>{user?.publications?.length || 0} publications</p>
              <p>{user?.collaborationInterests?.length || 0} collaboration interests</p>
              <Button size="sm" variant="outline" onClick={() => router.push("/researcher/profile")}>
                Edit profile
              </Button>
            </div>
          </div>
        </div>
      </div>

      <SectionHeader title="Top matches" actions={<Link href="/researcher/matches" className="text-sm text-nexus-700">All matches</Link>} />
      <div className="grid gap-4 md:grid-cols-3">
        {topMatches.map(({ match, opp }) => (
          <OpportunityCard key={opp.id} opportunity={opp} matchScore={match.overallScore} />
        ))}
        {!topMatches.length &&
          collaborationOpps.map((o) => (
            <OpportunityCard key={o.id} opportunity={o} />
          ))}
        {!topMatches.length && !collaborationOpps.length && (
          <p className="text-sm text-secondary">No matches yet — explore opportunities to generate scores.</p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-surface p-4">
          <SectionHeader title="Recent applications" actions={<Link href="/researcher/applications" className="text-sm text-nexus-700">View all</Link>} />
          <ul className="mt-3 space-y-2 text-sm">
            {recentApps.map((app) => {
              const opp = opportunities.find((o) => o.id === app.opportunityId);
              return (
                <li key={app.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700">
                  <span className="line-clamp-1 font-medium">{opp?.title || app.opportunityId}</span>
                  <Badge tone="teal">{app.status}</Badge>
                </li>
              );
            })}
            {!recentApps.length && <p className="text-secondary">No applications submitted yet.</p>}
          </ul>
        </div>

        <div className="card-surface p-4">
          <SectionHeader title="Collaboration summary" actions={<Link href="/researcher/collaborations" className="text-sm text-nexus-700">Collaborations</Link>} />
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <p className="text-2xl font-bold text-nexus-700">{activeCollabs.length}</p>
              <p className="text-sm text-secondary">Active collaborations</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <p className="text-2xl font-bold text-amber-600">{pendingCollabs.length}</p>
              <p className="text-sm text-secondary">Pending review</p>
            </div>
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            {activeCollabs.slice(0, 3).map((c, i) => (
              <li key={i} className="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700">
                <p className="font-medium">{c.opportunity.title}</p>
                <p className="text-secondary">{c.status}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card-surface p-4">
          <h3 className="font-semibold">Active projects</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {activeProjects.slice(0, 4).map((p) => (
              <li key={p.id} className="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700">
                <p className="font-medium">{p.title}</p>
                <p className="text-secondary">{p.status} · ends {formatDate(p.endDate)}</p>
              </li>
            ))}
            {!activeProjects.length &&
              (user?.currentProjects || []).slice(0, 4).map((p, i) => (
                <li key={i} className="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700">
                  <p className="font-medium">{typeof p === "string" ? p : p.title}</p>
                  <p className="text-secondary">{typeof p === "object" ? p.status : "Linked"}</p>
                </li>
              ))}
            {!activeProjects.length && !(user?.currentProjects?.length) && (
              <p className="text-secondary">No active projects linked.</p>
            )}
          </ul>
          <Button size="sm" variant="outline" className="mt-4" onClick={() => router.push("/researcher/projects")}>
            View projects
          </Button>
        </div>

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
          <Button size="sm" variant="outline" className="mt-4" onClick={() => router.push("/researcher/grants")}>
            Grant calls
          </Button>
        </div>

        <div className="card-surface p-4">
          <h3 className="font-semibold">Technologies</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {myTech.slice(0, 4).map((t) => (
              <li key={t.id} className="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700">
                <p className="font-medium">{t.title}</p>
                <Badge tone="teal" className="mt-1">{t.status}</Badge>
              </li>
            ))}
            {!myTech.length && <p className="text-secondary">No technologies listed yet.</p>}
          </ul>
          <Button size="sm" variant="outline" className="mt-4" onClick={() => router.push("/researcher/technology-transfer")}>
            Technology transfer
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-surface p-4">
          <SectionHeader title="Recent messages" actions={<Link href="/researcher/messages" className="text-sm text-nexus-700">Inbox</Link>} />
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
          <SectionHeader title="Notifications" actions={<Link href="/researcher/notifications" className="text-sm text-nexus-700">View all</Link>} />
          <ul className="space-y-3">
            {userNotifs.map((n) => (
              <li key={n.id} className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700">
                <p className="font-medium">{n.title}</p>
                <p className="text-secondary">{n.body}</p>
                <p className="mt-1 text-xs text-secondary">{formatRelative(n.createdAt)}</p>
              </li>
            ))}
            {!userNotifs.length && <p className="text-sm text-secondary">No notifications.</p>}
          </ul>
        </div>
      </div>

      <div className="card-surface p-4">
        <h3 className="font-semibold">Quick actions</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => router.push("/researcher/opportunities")}><Sparkles className="h-4 w-4" />Opportunities</Button>
          <Button size="sm" variant="secondary" onClick={() => router.push("/researcher/matches")}><Handshake className="h-4 w-4" />Matches</Button>
          <Button size="sm" variant="secondary" onClick={() => router.push("/researcher/grants")}><Banknote className="h-4 w-4" />Grants</Button>
          <Button size="sm" variant="secondary" onClick={() => router.push("/researcher/datasets")}><Database className="h-4 w-4" />Datasets</Button>
          <Button size="sm" variant="secondary" onClick={() => router.push("/researcher/publications")}><FileText className="h-4 w-4" />Publications</Button>
          <Button size="sm" variant="secondary" onClick={() => router.push("/researcher/messages")}><MessageSquare className="h-4 w-4" />Messages</Button>
        </div>
      </div>
    </div>
  );
}
