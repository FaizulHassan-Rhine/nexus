"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui";
import { Tabs, TabList, Tab, TabPanel } from "@/components/ui";
import { Button, Input, Textarea, Badge } from "@/components/ui";
import { OpportunityCard, OpportunityCollection } from "@/components/domain/Domain";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { projectService } from "@/lib/mockServices";
import { formatDate, formatCurrency } from "@/lib/formatters";
import { toast } from "sonner";
import {
  filterFacultyOpportunities,
  getFacultyProjects,
} from "../_lib/helpers";

export default function FacultyResearchPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const opportunities = useAppStore((s) => s.opportunities);
  const projects = useAppStore((s) => s.projects);
  const organizations = useAppStore((s) => s.organizations);
  const updateProfile = useAppStore((s) => s.updateProfile);

  const [interest, setInterest] = useState({ title: "", areas: "", labs: "", note: "" });
  const [joining, setJoining] = useState(null);
  const [view, setView] = useState("grid");

  const researchOpps = useMemo(
    () => filterFacultyOpportunities(opportunities, { category: "research" }),
    [opportunities]
  );
  const industryProblems = useMemo(
    () => opportunities.filter((o) => o.type === "Industry problem statement"),
    [opportunities]
  );
  const myProjects = useMemo(
    () => (user ? getFacultyProjects(projects, user.id) : []),
    [projects, user]
  );
  const openProjects = useMemo(
    () => projects.filter((p) => p.status === "Active" && p.ownerId !== user?.id),
    [projects, user]
  );
  const labTech = useMemo(
    () => opportunities.filter((o) => o.tags?.includes("Lab access") || o.type === "Technology licensing"),
    [opportunities]
  );

  const postInterest = async () => {
    if (!user || !interest.title.trim()) {
      toast.error("Title required");
      return;
    }
    await projectService.create({
      title: interest.title,
      type: "Collaboration call",
      description: interest.note,
      skills: interest.areas.split(",").map((s) => s.trim()).filter(Boolean),
      status: "Open",
      universityId: user.universityId,
      ownerId: user.id,
      ownerType: "faculty",
    });
    updateProfile(user.id, {
      collaborationInterests: [
        ...(user.collaborationInterests || []),
        { ...interest, postedAt: new Date().toISOString() },
      ],
    });
    toast.success("Collaboration interest posted");
    setInterest({ title: "", areas: "", labs: "", note: "" });
  };

  const joinProject = async (projectId) => {
    if (!user) return;
    setJoining(projectId);
    try {
      await projectService.join(projectId, user.id, "Research collaborator");
      toast.success("Joined project team");
    } finally {
      setJoining(null);
    }
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Research collaboration" description="Calls for collaborators, industry problems, labs, and team invitations" />

      <Tabs defaultValue="board">
        <TabList>
          <Tab value="board">Collaboration board</Tab>
          <Tab value="post">Post interest</Tab>
          <Tab value="join">Join project</Tab>
          <Tab value="mine">My research</Tab>
        </TabList>

        <TabPanel value="board">
          <div className="grid gap-6 lg:grid-cols-2">
            <section>
              <h3 className="font-semibold">Joint research opportunities</h3>
              <div className="mt-3">
                <OpportunityCollection view={view} onViewChange={setView} count={researchOpps.length} countLabel="calls">
                  {researchOpps.map((o) => (
                    <OpportunityCard key={o.id} opportunity={o} view={view} />
                  ))}
                </OpportunityCollection>
              </div>
            </section>
            <section>
              <h3 className="font-semibold">Industry problem statements</h3>
              <div className="mt-3 space-y-3">
                {industryProblems.map((o) => {
                  const org = organizations.find((x) => x.id === o.organizationId);
                  return (
                    <div key={o.id} className="card-surface p-4">
                      <Badge tone="amber">Industry challenge</Badge>
                      <p className="mt-2 font-medium">{o.title}</p>
                      <p className="text-sm text-secondary">{org?.name}</p>
                    </div>
                  );
                })}
              </div>
              <h3 className="mt-6 font-semibold">Labs & equipment</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {(user?.laboratoryAccess || []).map((lab) => (
                  <li key={lab} className="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700">{lab}</li>
                ))}
                {labTech.slice(0, 2).map((o) => (
                  <li key={o.id} className="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700">{o.title}</li>
                ))}
              </ul>
            </section>
          </div>
        </TabPanel>

        <TabPanel value="post">
          <div className="card-surface max-w-xl space-y-4 p-4">
            <Input label="Collaboration title" value={interest.title} onChange={(e) => setInterest({ ...interest, title: e.target.value })} />
            <Input label="Research areas (comma-separated)" value={interest.areas} onChange={(e) => setInterest({ ...interest, areas: e.target.value })} />
            <Input label="Lab access offered" value={interest.labs} onChange={(e) => setInterest({ ...interest, labs: e.target.value })} />
            <Textarea label="Description" rows={4} value={interest.note} onChange={(e) => setInterest({ ...interest, note: e.target.value })} />
            <Button onClick={postInterest}>Post collaboration interest</Button>
          </div>
        </TabPanel>

        <TabPanel value="join">
          <div className="space-y-3">
            {openProjects.slice(0, 8).map((p) => (
              <div key={p.id} className="card-surface flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">{p.title}</p>
                  <p className="text-sm text-secondary">{p.type} · {p.division} · {formatCurrency(p.fundingAmount, p.currency)}</p>
                  <p className="text-xs text-secondary">Team: {(p.teamMembers || []).length} members</p>
                </div>
                <Button size="sm" loading={joining === p.id} onClick={() => joinProject(p.id)}>Join project</Button>
              </div>
            ))}
          </div>
        </TabPanel>

        <TabPanel value="mine">
          <div className="space-y-3">
            {myProjects.map((p) => (
              <div key={p.id} className="card-surface p-4">
                <div className="flex flex-wrap gap-2">
                  <Badge tone="teal">{p.status}</Badge>
                  <Badge tone="slate">{p.type}</Badge>
                </div>
                <p className="mt-2 font-semibold">{p.title}</p>
                <p className="text-sm text-secondary">{p.description}</p>
                <p className="mt-2 text-xs text-secondary">{formatDate(p.startDate)} — {formatDate(p.endDate)}</p>
              </div>
            ))}
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
}
