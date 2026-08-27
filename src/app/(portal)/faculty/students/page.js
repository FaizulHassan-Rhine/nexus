"use client";

import { useMemo, useState } from "react";
import { PageHeader, DataTable } from "@/components/ui";
import { Tabs, TabList, Tab, TabPanel } from "@/components/ui";
import { Button, Textarea, Badge, Avatar } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { formatDate } from "@/lib/formatters";
import { toast } from "sonner";
import {
  getSupervisedStudents,
  getFacultyProjects,
  defaultRecommendationRequests,
} from "../_lib/helpers";

export default function FacultyStudentsPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const projects = useAppStore((s) => s.projects);
  const users = useAppStore((s) => s.users);
  const updateProfile = useAppStore((s) => s.updateProfile);

  const [letterDraft, setLetterDraft] = useState("");
  const [activeRec, setActiveRec] = useState(null);

  const students = useMemo(
    () => (user ? getSupervisedStudents(projects, users, user.id) : []),
    [projects, users, user]
  );
  const myProjects = useMemo(
    () => (user ? getFacultyProjects(projects, user.id) : []),
    [projects, user]
  );
  const recommendations = useMemo(() => {
    if (user?.recommendationRequests?.length) return user.recommendationRequests;
    return defaultRecommendationRequests(students, user?.id);
  }, [user, students]);

  const pendingApprovals = useMemo(
    () =>
      myProjects.flatMap((p) =>
        (p.teamMembers || [])
          .filter((id) => id !== user?.id && !students.find((s) => s.id === id))
          .map((id) => ({ projectId: p.id, projectTitle: p.title, studentId: id, user: users.find((u) => u.id === id) }))
      ),
    [myProjects, students, users, user]
  );

  const approveSupervision = (studentId, projectId) => {
    if (!user) return;
    updateProfile(user.id, {
      supervisionApprovals: [
        ...(user.supervisionApprovals || []),
        { studentId, projectId, approvedAt: new Date().toISOString() },
      ],
    });
    toast.success("Supervision request approved");
  };

  const acceptRecommendation = (recId) => {
    if (!user) return;
    const updated = recommendations.map((r) =>
      r.id === recId ? { ...r, status: "In progress" } : r
    );
    updateProfile(user.id, { recommendationRequests: updated });
    setActiveRec(recId);
    toast.success("Recommendation request accepted");
  };

  const uploadLetter = () => {
    if (!user || !activeRec || !letterDraft.trim()) {
      toast.error("Letter content required");
      return;
    }
    const updated = recommendations.map((r) =>
      r.id === activeRec ? { ...r, status: "Completed", letter: letterDraft, completedAt: new Date().toISOString() } : r
    );
    updateProfile(user.id, { recommendationRequests: updated });
    toast.success("Recommendation letter uploaded");
    setLetterDraft("");
    setActiveRec(null);
  };

  const columns = [
    {
      key: "name",
      label: "Student",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Avatar name={row.name} src={row.avatar} size="sm" />
          <span className="font-medium">{row.name}</span>
        </div>
      ),
    },
    { key: "programme", label: "Programme", render: (row) => row.programme || "—" },
    { key: "department", label: "Department", render: (row) => row.department || "—" },
    {
      key: "year",
      label: "Year",
      render: (row) => row.currentYear || "—",
    },
  ];

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Students" description="Supervised and mentored students, recommendation letters, and pending approvals" />

      <Tabs defaultValue="supervised">
        <TabList>
          <Tab value="supervised">Supervised ({students.length})</Tab>
          <Tab value="recommendations">Recommendations ({recommendations.filter((r) => r.status !== "Completed").length})</Tab>
          <Tab value="approvals">Pending approvals</Tab>
          <Tab value="progress">Progress</Tab>
        </TabList>

        <TabPanel value="supervised">
          {students.length ? (
            <DataTable columns={columns} rows={students} />
          ) : (
            <p className="text-secondary">No students linked via active projects.</p>
          )}
        </TabPanel>

        <TabPanel value="recommendations">
          <ul className="space-y-3">
            {recommendations.map((rec) => {
              const student = users.find((u) => u.id === rec.studentId);
              return (
                <li key={rec.id} className="card-surface p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{student?.name || rec.studentId}</p>
                      <p className="text-sm text-secondary">{rec.purpose} · Requested {formatDate(rec.requestedAt)}</p>
                    </div>
                    <Badge tone={rec.status === "Completed" ? "green" : rec.status === "Pending" ? "amber" : "teal"}>
                      {rec.status}
                    </Badge>
                  </div>
                  {rec.status === "Pending" ? (
                    <Button size="sm" className="mt-3" onClick={() => acceptRecommendation(rec.id)}>Accept request</Button>
                  ) : null}
                  {rec.status === "In progress" && activeRec === rec.id ? (
                    <div className="mt-3 space-y-2">
                      <Textarea rows={4} value={letterDraft} onChange={(e) => setLetterDraft(e.target.value)} placeholder="Recommendation letter content..." />
                      <Button size="sm" onClick={uploadLetter}>Upload letter</Button>
                    </div>
                  ) : null}
                  {rec.letter ? <p className="mt-2 text-sm text-secondary line-clamp-2">{rec.letter}</p> : null}
                </li>
              );
            })}
          </ul>
        </TabPanel>

        <TabPanel value="approvals">
          {pendingApprovals.length ? (
            <ul className="space-y-3">
              {pendingApprovals.map((a) => (
                <li key={`${a.projectId}-${a.studentId}`} className="card-surface flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{a.user?.name || a.studentId}</p>
                    <p className="text-sm text-secondary">Project: {a.projectTitle}</p>
                  </div>
                  <Button size="sm" onClick={() => approveSupervision(a.studentId, a.projectId)}>Approve</Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-secondary">No pending supervision approvals.</p>
          )}
        </TabPanel>

        <TabPanel value="progress">
          <div className="space-y-3">
            {myProjects.map((p) => (
              <div key={p.id} className="card-surface p-4">
                <p className="font-semibold">{p.title}</p>
                <p className="text-sm text-secondary">{p.status} · Team of {(p.teamMembers || []).length}</p>
                <ul className="mt-2 text-sm">
                  {(p.teamMembers || [])
                    .filter((id) => id !== user?.id)
                    .map((id) => {
                      const s = users.find((u) => u.id === id);
                      return <li key={id}>{s?.name || id} — {s?.programme || "Collaborator"}</li>;
                    })}
                </ul>
              </div>
            ))}
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
}
