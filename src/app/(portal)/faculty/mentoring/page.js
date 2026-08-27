"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui";
import { Tabs, TabList, Tab, TabPanel } from "@/components/ui";
import { Button, Input, Textarea, Switch, Badge } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { formatDate } from "@/lib/formatters";
import { toast } from "sonner";
import {
  getSupervisedStudents,
  defaultMentoringRequests,
} from "../_lib/helpers";

export default function FacultyMentoringPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const projects = useAppStore((s) => s.projects);
  const users = useAppStore((s) => s.users);
  const updateProfile = useAppStore((s) => s.updateProfile);

  const [availability, setAvailability] = useState({
    open: user?.availability?.open ?? true,
    hoursPerWeek: user?.availability?.hoursPerWeek ?? 8,
    notes: user?.availability?.notes ?? "",
  });
  const [sessionForm, setSessionForm] = useState({ topic: "", scheduledAt: "", notes: "" });
  const [feedback, setFeedback] = useState("");

  const students = useMemo(
    () => (user ? getSupervisedStudents(projects, users, user.id) : []),
    [projects, users, user]
  );
  const requests = useMemo(() => {
    if (user?.mentoringRequests?.length) return user.mentoringRequests;
    return defaultMentoringRequests(students);
  }, [user, students]);
  const sessions = user?.mentoringSessions || [];

  const saveProfile = () => {
    if (!user) return;
    updateProfile(user.id, { availability });
    toast.success("Mentoring profile updated");
  };

  const respondRequest = (reqId, accept) => {
    if (!user) return;
    const updated = requests.map((r) =>
      r.id === reqId ? { ...r, status: accept ? "Accepted" : "Declined" } : r
    );
    updateProfile(user.id, { mentoringRequests: updated });
    toast.success(accept ? "Mentoring request accepted" : "Request declined");
  };

  const scheduleSession = () => {
    if (!user || !sessionForm.topic.trim() || !sessionForm.scheduledAt) {
      toast.error("Topic and date required");
      return;
    }
    updateProfile(user.id, {
      mentoringSessions: [
        ...sessions,
        { id: `sess-${Date.now()}`, ...sessionForm, status: "Scheduled", createdAt: new Date().toISOString() },
      ],
    });
    toast.success("Session scheduled");
    setSessionForm({ topic: "", scheduledAt: "", notes: "" });
  };

  const submitFeedback = (sessionId) => {
    if (!user || !feedback.trim()) return;
    updateProfile(user.id, {
      mentoringSessions: sessions.map((s) =>
        s.id === sessionId ? { ...s, feedback, status: "Completed", completedAt: new Date().toISOString() } : s
      ),
    });
    toast.success("Session feedback saved");
    setFeedback("");
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Mentoring" description="Profile, availability, requests, sessions, notes, and feedback" />

      <Tabs defaultValue="profile">
        <TabList>
          <Tab value="profile">Profile</Tab>
          <Tab value="requests">Requests ({requests.filter((r) => r.status === "Pending").length})</Tab>
          <Tab value="sessions">Sessions</Tab>
          <Tab value="feedback">Feedback</Tab>
        </TabList>

        <TabPanel value="profile">
          <div className="card-surface max-w-lg space-y-4 p-4">
            <Switch label="Accepting mentoring requests" checked={availability.open} onChange={(v) => setAvailability({ ...availability, open: v })} />
            <Input
              label="Hours per week available"
              type="number"
              value={availability.hoursPerWeek}
              onChange={(e) => setAvailability({ ...availability, hoursPerWeek: e.target.value })}
            />
            <Textarea label="Notes" rows={3} value={availability.notes} onChange={(e) => setAvailability({ ...availability, notes: e.target.value })} />
            <div className="flex flex-wrap gap-1">
              {(user?.teachingExpertise || []).map((t) => (
                <Badge key={t} tone="teal">{t}</Badge>
              ))}
            </div>
            <Button onClick={saveProfile}>Save mentoring profile</Button>
          </div>
        </TabPanel>

        <TabPanel value="requests">
          <ul className="space-y-3">
            {requests.map((req) => {
              const student = users.find((u) => u.id === req.studentId);
              return (
                <li key={req.id} className="card-surface flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-medium">{student?.name || req.studentId}</p>
                    <p className="text-sm text-secondary">{req.topic}</p>
                    <Badge tone="slate" className="mt-1">{req.status}</Badge>
                  </div>
                  {req.status === "Pending" ? (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => respondRequest(req.id, true)}>Accept</Button>
                      <Button size="sm" variant="secondary" onClick={() => respondRequest(req.id, false)}>Decline</Button>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </TabPanel>

        <TabPanel value="sessions">
          <div className="card-surface mb-6 max-w-lg space-y-4 p-4">
            <Input label="Topic" value={sessionForm.topic} onChange={(e) => setSessionForm({ ...sessionForm, topic: e.target.value })} />
            <Input label="Scheduled at" type="datetime-local" value={sessionForm.scheduledAt} onChange={(e) => setSessionForm({ ...sessionForm, scheduledAt: e.target.value })} />
            <Textarea label="Session notes" rows={2} value={sessionForm.notes} onChange={(e) => setSessionForm({ ...sessionForm, notes: e.target.value })} />
            <Button onClick={scheduleSession}>Schedule session</Button>
          </div>
          <ul className="space-y-2">
            {sessions.map((s) => (
              <li key={s.id} className="card-surface p-4 text-sm">
                <p className="font-medium">{s.topic}</p>
                <p className="text-secondary">{formatDate(s.scheduledAt)} · {s.status}</p>
                {s.notes ? <p className="mt-1">{s.notes}</p> : null}
              </li>
            ))}
            {!sessions.length && <p className="text-secondary">No sessions scheduled.</p>}
          </ul>
        </TabPanel>

        <TabPanel value="feedback">
          <div className="space-y-4">
            {sessions.filter((s) => s.status !== "Completed").map((s) => (
              <div key={s.id} className="card-surface p-4">
                <p className="font-medium">{s.topic}</p>
                <Textarea rows={3} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Session feedback for student..." className="mt-2" />
                <Button size="sm" className="mt-2" onClick={() => submitFeedback(s.id)}>Save feedback</Button>
              </div>
            ))}
            {sessions.filter((s) => s.feedback).map((s) => (
              <div key={`fb-${s.id}`} className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-700">
                <p className="font-medium">{s.topic}</p>
                <p className="text-secondary">{s.feedback}</p>
              </div>
            ))}
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
}
