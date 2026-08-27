"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui";
import { Tabs, TabList, Tab, TabPanel } from "@/components/ui";
import { Button, Input, Textarea, Badge, Progress } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { getFacultyTechnologies, getFacultyProjects } from "../_lib/helpers";
import { formatDate } from "@/lib/formatters";
import { toast } from "sonner";

export default function FacultyProfilePage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const technologies = useAppStore((s) => s.technologies);
  const projects = useAppStore((s) => s.projects);
  const updateProfile = useAppStore((s) => s.updateProfile);

  const [form, setForm] = useState({
    name: user?.name || "",
    designation: user?.designation || "",
    department: user?.department || "",
    employeeId: user?.employeeId || "",
    researchAreas: (user?.researchAreas || []).join(", "),
    consultancyExpertise: (user?.consultancyExpertise || []).join(", "),
    teachingExpertise: (user?.teachingExpertise || []).join(", "),
    bio: user?.bio || "",
  });

  const myTech = user ? getFacultyTechnologies(technologies, user.id) : [];
  const myProjects = user ? getFacultyProjects(projects, user.id) : [];

  const save = () => {
    if (!user) return;
    updateProfile(user.id, {
      name: form.name,
      designation: form.designation,
      department: form.department,
      employeeId: form.employeeId,
      researchAreas: form.researchAreas.split(",").map((s) => s.trim()).filter(Boolean),
      consultancyExpertise: form.consultancyExpertise.split(",").map((s) => s.trim()).filter(Boolean),
      teachingExpertise: form.teachingExpertise.split(",").map((s) => s.trim()).filter(Boolean),
      bio: form.bio,
      profileCompletion: Math.min(100, (user.profileCompletion || 90) + 1),
    });
    toast.success("Faculty profile updated");
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Faculty profile" description="Research identity, publications, patents, and expertise" />

      <div className="card-surface p-4">
        <Progress value={user?.profileCompletion || 0} label="Profile completion" />
      </div>

      <Tabs defaultValue="overview">
        <TabList>
          <Tab value="overview">Overview</Tab>
          <Tab value="research">Research</Tab>
          <Tab value="publications">Publications</Tab>
          <Tab value="technologies">Technologies</Tab>
        </TabList>

        <TabPanel value="overview">
          <div className="card-surface max-w-2xl space-y-4 p-4">
            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
            <Input label="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
            <Input label="Employee ID" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} />
            <Textarea label="Bio" rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            <Button onClick={save}>Save profile</Button>
          </div>
        </TabPanel>

        <TabPanel value="research">
          <div className="card-surface max-w-2xl space-y-4 p-4">
            <Input label="Research areas (comma-separated)" value={form.researchAreas} onChange={(e) => setForm({ ...form, researchAreas: e.target.value })} />
            <Input label="Consultancy expertise" value={form.consultancyExpertise} onChange={(e) => setForm({ ...form, consultancyExpertise: e.target.value })} />
            <Input label="Teaching expertise" value={form.teachingExpertise} onChange={(e) => setForm({ ...form, teachingExpertise: e.target.value })} />
            <div>
              <p className="text-sm font-medium">Laboratory access</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {(user?.laboratoryAccess || []).map((lab) => (
                  <Badge key={lab} tone="teal">{lab}</Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Active projects ({myProjects.length})</p>
              <ul className="mt-2 space-y-1 text-sm text-secondary">
                {myProjects.map((p) => (
                  <li key={p.id}>{p.title} — {p.status}</li>
                ))}
              </ul>
            </div>
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
          </ul>
        </TabPanel>

        <TabPanel value="technologies">
          <ul className="space-y-3">
            {myTech.map((t) => (
              <li key={t.id} className="card-surface p-4">
                <p className="font-medium">{t.title}</p>
                <p className="text-sm text-secondary">{t.status} · {formatDate(t.createdAt)}</p>
              </li>
            ))}
          </ul>
        </TabPanel>
      </Tabs>
    </div>
  );
}
