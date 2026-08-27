"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { Tabs, TabList, Tab, TabPanel } from "@/components/ui";
import { Button, Badge, Input, Textarea, Modal, EmptyState } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { toast } from "sonner";

function ProjectList({ list }) {
  if (!list.length) return <EmptyState title="Nothing here yet" />;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {list.map((p) => (
        <article key={p.id} className="card-surface p-4">
          <Badge tone="teal">{p.type}</Badge>
          <h3 className="mt-2 font-semibold">
            <Link href={`/student/projects/${p.id}`} className="hover:text-nexus-700">
              {p.title}
            </Link>
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-secondary">{p.description}</p>
          <div className="mt-3 flex flex-wrap gap-1">
            {(p.skills || []).slice(0, 4).map((s) => (
              <Badge key={s} tone="slate">
                {s}
              </Badge>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

export default function ProjectsPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const router = useRouter();
  const projects = useAppStore((s) => s.projects);
  const createProject = useAppStore((s) => s.createProject);

  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("Student project");

  const myProjects = useMemo(
    () => projects.filter((p) => p.ownerId === user?.id || p.teamMembers?.includes(user?.id) || p.team?.some((t) => t.userId === user?.id)),
    [projects, user]
  );
  const discover = projects.filter((p) => p.status === "Active" && !myProjects.some((m) => m.id === p.id));
  const challenges = projects.filter((p) => p.type === "Industry challenge");
  const research = projects.filter((p) => p.type === "Research project");
  const invitations = (user?.projectInvitations || []).map((inv) => ({
    ...inv,
    project: projects.find((p) => p.id === inv.projectId),
  }));

  const handleCreate = () => {
    if (!title.trim()) {
      toast.error("Title required");
      return;
    }
    const project = createProject({
      title,
      description,
      type,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      division: user?.preferredLocation || "Dhaka",
      skills: user?.skills?.slice(0, 4) || [],
    });
    toast.success("Project created");
    setCreateOpen(false);
    setTitle("");
    setDescription("");
    router.push(`/student/projects/${project.id}`);
  };

  const acceptInvite = (inv) => {
    if (!user) return;
    const updateProfile = useAppStore.getState().updateProfile;
    const next = (user.projectInvitations || []).map((i) =>
      i.id === inv.id ? { ...i, status: "Accepted" } : i
    );
    updateProfile(user.id, { projectInvitations: next });
    toast.success("Invitation accepted");
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Discover collaborations, manage your projects, and join challenges"
        actions={<Button onClick={() => setCreateOpen(true)}>Create project</Button>}
      />

      <Tabs defaultValue="discover">
        <TabList>
          <Tab value="discover">Discover</Tab>
          <Tab value="my">My projects ({myProjects.length})</Tab>
          <Tab value="challenges">Challenges</Tab>
          <Tab value="research">Research</Tab>
          <Tab value="invitations">Invitations ({invitations.length})</Tab>
        </TabList>
        <TabPanel value="discover"><ProjectList list={discover.slice(0, 12)} /></TabPanel>
        <TabPanel value="my"><ProjectList list={myProjects} /></TabPanel>
        <TabPanel value="challenges"><ProjectList list={challenges} /></TabPanel>
        <TabPanel value="research"><ProjectList list={research} /></TabPanel>
        <TabPanel value="invitations">
          {invitations.length ? (
            <ul className="space-y-3">
              {invitations.map((inv) => (
                <li key={inv.id} className="card-surface flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{inv.project?.title || inv.projectId}</p>
                    <p className="text-sm text-secondary">Role: {inv.role} · {inv.status}</p>
                  </div>
                  {inv.status === "Pending" ? (
                    <Button size="sm" onClick={() => acceptInvite(inv)}>Accept</Button>
                  ) : (
                    <Badge tone="green">{inv.status}</Badge>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No invitations" description="Team leads can invite you to join their projects." />
          )}
        </TabPanel>
      </Tabs>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create project">
        <div className="space-y-4">
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
          <Input label="Type" value={type} onChange={(e) => setType(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
