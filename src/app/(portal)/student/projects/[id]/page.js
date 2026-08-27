"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { Badge, StatusBadge, Button } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { formatCurrency, formatDate } from "@/lib/formatters";

export default function ProjectDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const projects = useAppStore((s) => s.projects);
  const users = useAppStore((s) => s.users);
  const opportunities = useAppStore((s) => s.opportunities);

  const project = projects.find((p) => p.id === id);
  const isMember =
    project?.ownerId === user?.id ||
    project?.teamMembers?.includes(user?.id) ||
    project?.team?.some((t) => t.userId === user?.id);
  const owner = users.find((u) => u.id === project?.ownerId);
  const team = (project?.teamMembers || project?.team?.map((t) => t.userId) || []).map((uid) =>
    users.find((u) => u.id === uid)
  ).filter(Boolean);
  const linkedOpps = (project?.linkedOpportunityIds || [])
    .map((oid) => opportunities.find((o) => o.id === oid))
    .filter(Boolean);

  if (!hydrated) return null;

  if (!project) {
    return (
      <div>
        <PageHeader title="Project not found" />
        <Link href="/student/projects" className="text-nexus-700">← Back</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={project.title}
        description={project.type}
        breadcrumbs={<Link href="/student/projects" className="text-sm text-nexus-700">← Projects</Link>}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card-surface space-y-4 p-4 lg:col-span-2">
          <StatusBadge status={project.status} />
          <p className="text-secondary">{project.description}</p>
          <div className="flex flex-wrap gap-2">
            {(project.skills || []).map((s) => (
              <Badge key={s} tone="teal">{s}</Badge>
            ))}
          </div>
          {(project.tags || []).length ? (
            <div className="flex flex-wrap gap-1">
              {project.tags.map((t) => (
                <Badge key={t} tone="slate">{t}</Badge>
              ))}
            </div>
          ) : null}
          {project.milestones?.length ? (
            <div>
              <h3 className="font-semibold">Milestones</h3>
              <ul className="mt-2 space-y-2 text-sm">
                {project.milestones.map((m, i) => (
                  <li key={i} className="flex justify-between rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700">
                    <span>{m.title || m.label}</span>
                    <StatusBadge status={m.status || "Pending"} />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="card-surface p-4 text-sm">
            <h3 className="font-semibold">Details</h3>
            <dl className="mt-3 space-y-2">
              <div className="flex justify-between"><dt className="text-secondary">Owner</dt><dd>{owner?.name || "—"}</dd></div>
              <div className="flex justify-between"><dt className="text-secondary">Division</dt><dd>{project.division}</dd></div>
              <div className="flex justify-between"><dt className="text-secondary">Start</dt><dd>{formatDate(project.startDate)}</dd></div>
              <div className="flex justify-between"><dt className="text-secondary">End</dt><dd>{formatDate(project.endDate)}</dd></div>
              {project.fundingAmount ? (
                <div className="flex justify-between"><dt className="text-secondary">Funding</dt><dd>{formatCurrency(project.fundingAmount)}</dd></div>
              ) : null}
            </dl>
          </div>
          <div className="card-surface p-4">
            <h3 className="font-semibold">Team</h3>
            <ul className="mt-2 space-y-1 text-sm">
              {team.map((m) => (
                <li key={m.id}>{m.name}</li>
              ))}
              {!team.length && <li className="text-secondary">No team listed</li>}
            </ul>
          </div>
          {linkedOpps.length ? (
            <div className="card-surface p-4">
              <h3 className="font-semibold">Linked opportunities</h3>
              <ul className="mt-2 space-y-1 text-sm">
                {linkedOpps.map((o) => (
                  <li key={o.id}>
                    <Link href={`/opportunities/${o.slug}`} className="text-nexus-700">{o.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {isMember ? (
            <Button variant="secondary" onClick={() => router.push("/student/funding")}>
              Request project funding
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
