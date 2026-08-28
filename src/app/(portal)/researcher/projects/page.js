"use client";

import { useMemo } from "react";
import { PageHeader } from "@/components/ui";
import { Badge } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { getResearcherProjects } from "../_lib/helpers";
import { formatDate, formatCurrency } from "@/lib/formatters";

export default function ResearcherProjectsPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const projects = useAppStore((s) => s.projects);
  const organizations = useAppStore((s) => s.organizations);

  const myProjects = useMemo(
    () => (user ? getResearcherProjects(projects, user.id, user) : []),
    [projects, user]
  );

  const linkedFromProfile = useMemo(() => {
    if (!user?.currentProjects?.length) return [];
    return (user.currentProjects || [])
      .map((p) => {
        if (typeof p === "object" && p.id) {
          const full = projects.find((proj) => proj.id === p.id);
          return full || { id: p.id, title: p.title, status: p.status, description: "Linked from profile" };
        }
        const full = projects.find((proj) => proj.id === p);
        return full || { id: p, title: p, status: "Linked", description: "Project reference from profile" };
      })
      .filter((p) => !myProjects.some((mp) => mp.id === p.id));
  }, [user, projects, myProjects]);

  const allProjects = useMemo(
    () => [...myProjects, ...linkedFromProfile],
    [myProjects, linkedFromProfile]
  );

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description={`${allProjects.length} research projects linked to your profile`}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {allProjects.map((p) => {
          const org = organizations.find((o) => o.id === p.organizationId);
          return (
            <article key={p.id} className="card-surface p-4">
              <div className="flex flex-wrap gap-2">
                <Badge tone="teal">{p.status || "Active"}</Badge>
                {p.type ? <Badge tone="slate">{p.type}</Badge> : null}
              </div>
              <h3 className="mt-2 font-semibold">{p.title}</h3>
              <p className="mt-1 text-sm text-secondary line-clamp-2">{p.description}</p>
              <div className="mt-3 space-y-1 text-xs text-secondary">
                {org ? <p>Partner: {org.name}</p> : null}
                {p.startDate ? <p>{formatDate(p.startDate)} — {formatDate(p.endDate)}</p> : null}
                {p.fundingAmount ? <p>Funding: {formatCurrency(p.fundingAmount, p.currency)}</p> : null}
                {p.teamMembers?.length ? <p>Team: {p.teamMembers.length} members</p> : null}
              </div>
              {p.skills?.length ? (
                <div className="mt-3 flex flex-wrap gap-1">
                  {p.skills.slice(0, 4).map((s) => (
                    <Badge key={s} tone="violet">{s}</Badge>
                  ))}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      {!allProjects.length && (
        <p className="text-center text-secondary">No projects linked to your researcher profile yet.</p>
      )}
    </div>
  );
}
