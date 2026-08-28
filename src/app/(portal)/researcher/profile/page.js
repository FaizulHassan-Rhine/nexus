"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui";
import { Tabs, TabList, Tab, TabPanel } from "@/components/ui";
import { Button, Input, Textarea, Badge, Progress } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { getResearcherProjects, getResearcherTechnologies } from "../_lib/helpers";
import { formatDate } from "@/lib/formatters";
import { toast } from "sonner";

export default function ResearcherProfilePage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const technologies = useAppStore((s) => s.technologies);
  const projects = useAppStore((s) => s.projects);
  const updateProfile = useAppStore((s) => s.updateProfile);

  const [form, setForm] = useState({
    name: user?.name || "",
    department: user?.department || "",
    orcid: user?.orcid || "",
    affiliationType: user?.affiliationType || "university",
    researchAreas: (user?.researchAreas || []).join(", "),
    collaborationInterests: (user?.collaborationInterests || []).join(", "),
    bio: user?.bio || "",
  });

  const myProjects = user ? getResearcherProjects(projects, user.id, user) : [];
  const myTech = user ? getResearcherTechnologies(technologies, user.id) : [];

  const save = () => {
    if (!user) return;
    updateProfile(user.id, {
      name: form.name,
      department: form.department,
      orcid: form.orcid,
      affiliationType: form.affiliationType,
      researchAreas: form.researchAreas.split(",").map((s) => s.trim()).filter(Boolean),
      collaborationInterests: form.collaborationInterests.split(",").map((s) => s.trim()).filter(Boolean),
      bio: form.bio,
      profileCompletion: Math.min(100, (user.profileCompletion || 91) + 1),
    });
    toast.success("Research profile updated");
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Research profile" description="ORCID, affiliation, research areas, publications, and collaboration interests" />

      <div className="card-surface p-4">
        <Progress value={user?.profileCompletion || 0} label="Profile completion" />
      </div>

      <Tabs defaultValue="overview">
        <TabList>
          <Tab value="overview">Overview</Tab>
          <Tab value="affiliation">Affiliation</Tab>
          <Tab value="research">Research areas</Tab>
          <Tab value="publications">Publications</Tab>
        </TabList>

        <TabPanel value="overview">
          <div className="card-surface max-w-2xl space-y-4 p-4">
            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
            <Input label="ORCID" value={form.orcid} onChange={(e) => setForm({ ...form, orcid: e.target.value })} placeholder="0000-0002-1825-0097" />
            <Textarea label="Bio" rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            <div>
              <p className="text-sm font-medium">Availability</p>
              <p className="mt-1 text-sm text-secondary">
                {user?.availability?.open ? "Open for collaboration" : "Limited availability"}
                {user?.availability?.hoursPerWeek ? ` · ${user.availability.hoursPerWeek} hrs/week` : ""}
              </p>
              {user?.availability?.notes ? (
                <p className="mt-1 text-xs text-secondary">{user.availability.notes}</p>
              ) : null}
            </div>
            <Button onClick={save}>Save profile</Button>
          </div>
        </TabPanel>

        <TabPanel value="affiliation">
          <div className="card-surface max-w-2xl space-y-4 p-4">
            <Input
              label="Affiliation type"
              value={form.affiliationType}
              onChange={(e) => setForm({ ...form, affiliationType: e.target.value })}
              placeholder="university, independent, institute..."
            />
            <p className="text-sm text-secondary">University ID: {user?.universityId || "—"}</p>
            <p className="text-sm text-secondary">Preferred location: {user?.preferredLocation || "—"}</p>
            <div>
              <p className="text-sm font-medium">Dataset publishing</p>
              <Badge tone={user?.datasetPublishing ? "green" : "slate"} className="mt-1">
                {user?.datasetPublishing ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium">Active projects ({myProjects.length})</p>
              <ul className="mt-2 space-y-1 text-sm text-secondary">
                {myProjects.map((p) => (
                  <li key={p.id}>{p.title} — {p.status}</li>
                ))}
              </ul>
            </div>
            <Button onClick={save}>Save affiliation</Button>
          </div>
        </TabPanel>

        <TabPanel value="research">
          <div className="card-surface max-w-2xl space-y-4 p-4">
            <Input
              label="Research areas (comma-separated)"
              value={form.researchAreas}
              onChange={(e) => setForm({ ...form, researchAreas: e.target.value })}
            />
            <Input
              label="Collaboration interests"
              value={form.collaborationInterests}
              onChange={(e) => setForm({ ...form, collaborationInterests: e.target.value })}
            />
            <div className="flex flex-wrap gap-1">
              {(user?.researchAreas || []).map((area) => (
                <Badge key={area} tone="teal">{area}</Badge>
              ))}
            </div>
            {myTech.length ? (
              <div>
                <p className="text-sm font-medium">Linked technologies</p>
                <ul className="mt-2 space-y-1 text-sm text-secondary">
                  {myTech.map((t) => (
                    <li key={t.id}>{t.title}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <Button onClick={save}>Save research profile</Button>
          </div>
        </TabPanel>

        <TabPanel value="publications">
          <ul className="space-y-3">
            {(user?.publications || []).map((pub, i) => (
              <li key={i} className="card-surface p-4">
                <p className="font-medium">{pub.title}</p>
                <p className="text-sm text-secondary">{pub.journal} · {pub.year}</p>
              </li>
            ))}
            {(user?.patents || []).map((pat, i) => (
              <li key={`pat-${i}`} className="card-surface p-4">
                <Badge tone="violet">Patent</Badge>
                <p className="mt-1 font-medium">{pat.title}</p>
                <p className="text-sm text-secondary">{pat.status} · {pat.year}</p>
              </li>
            ))}
            {!user?.publications?.length && !user?.patents?.length && (
              <p className="text-secondary">No publications listed yet.</p>
            )}
          </ul>
        </TabPanel>
      </Tabs>
    </div>
  );
}
