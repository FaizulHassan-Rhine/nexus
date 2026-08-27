"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui";
import { Button, Input, Select, Textarea, Modal, MultiStepForm, StatusBadge, Avatar } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { applicationService } from "@/lib/mockServices";
import { formatDate } from "@/lib/formatters";
import { toast } from "sonner";
import { getOrgApplications, patchApplication } from "../_lib/helpers";

const STEPS = ["Candidate", "Schedule", "Interviewers", "Confirm"];

export default function InterviewsPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const applications = useAppStore((s) => s.applications);
  const opportunities = useAppStore((s) => s.opportunities);
  const users = useAppStore((s) => s.users);

  const [view, setView] = useState("list");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [feedbackOpen, setFeedbackOpen] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [form, setForm] = useState({
    applicationId: "",
    date: "",
    time: "11:00",
    mode: "Hybrid",
    location: "",
    interviewer: user?.name || "",
    notes: "",
  });

  const orgApps = useMemo(
    () => getOrgApplications(applications, opportunities, user?.organizationId),
    [applications, opportunities, user]
  );

  const scheduled = orgApps.filter((a) => a.status === "Interview scheduled" || a.interviewDetails?.date);
  const shortlisted = orgApps.filter((a) => a.status === "Shortlisted");

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const scheduleInterview = async () => {
    if (!form.applicationId || !form.date) {
      toast.error("Select candidate and date");
      return;
    }
    const datetime = `${form.date}T${form.time}:00+06:00`;
    patchApplication(form.applicationId, {
      status: "Interview scheduled",
      interviewDetails: {
        date: datetime,
        mode: form.mode,
        location: form.location || form.mode,
        interviewer: form.interviewer,
        notes: form.notes,
      },
    });
    await applicationService.updateStatus(form.applicationId, "Interview scheduled", `Interview ${formatDate(datetime)}`, user?.role);
    toast.success("Interview scheduled — candidate notified");
    setWizardOpen(false);
    setStep(0);
  };

  const submitFeedback = (appId) => {
    patchApplication(appId, { interviewerFeedback: feedback, feedbackAt: new Date().toISOString() });
    toast.success("Feedback saved");
    setFeedbackOpen(null);
    setFeedback("");
  };

  const reschedule = (app) => {
    setForm({
      applicationId: app.id,
      date: app.interviewDetails?.date?.slice(0, 10) || "",
      time: "11:00",
      mode: app.interviewDetails?.mode || "Hybrid",
      location: app.interviewDetails?.location || "",
      interviewer: app.interviewDetails?.interviewer || user?.name,
      notes: "",
    });
    setWizardOpen(true);
    setStep(1);
  };

  const cancelInterview = async (appId) => {
    await applicationService.updateStatus(appId, "Shortlisted", "Interview cancelled", user?.role);
    patchApplication(appId, { interviewDetails: null });
    toast.success("Interview cancelled");
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Interviews"
        description={`${scheduled.length} scheduled · Schedule, feedback, and reschedule`}
        actions={
          <>
            <Button variant={view === "list" ? "primary" : "secondary"} size="sm" onClick={() => setView("list")}>List</Button>
            <Button variant={view === "calendar" ? "primary" : "secondary"} size="sm" onClick={() => setView("calendar")}>Calendar</Button>
            <Button onClick={() => { setWizardOpen(true); setStep(0); }}>Schedule interview</Button>
          </>
        }
      />

      {view === "calendar" ? (
        <div className="card-surface p-4">
          <div className="grid gap-2 sm:grid-cols-7">
            {scheduled.map((app) => {
              const candidate = users.find((u) => u.id === app.applicantId);
              const d = new Date(app.interviewDetails?.date);
              return (
                <div key={app.id} className="rounded-lg border border-nexus-200 bg-nexus-50 p-2 text-xs dark:border-nexus-800 dark:bg-nexus-950">
                  <p className="font-medium">{formatDate(app.interviewDetails?.date, "dd MMM")}</p>
                  <p>{candidate?.name}</p>
                  <p className="text-secondary">{app.interviewDetails?.mode}</p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <ul className="space-y-3">
          {scheduled.map((app) => {
            const candidate = users.find((u) => u.id === app.applicantId);
            const opp = opportunities.find((o) => o.id === app.opportunityId);
            return (
              <li key={app.id} className="card-surface flex flex-wrap items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3">
                  <Avatar name={candidate?.name} src={candidate?.avatar} />
                  <div>
                    <p className="font-medium">{candidate?.name}</p>
                    <p className="text-sm text-secondary">{opp?.title}</p>
                    <p className="text-xs text-secondary">
                      {formatDate(app.interviewDetails?.date, "dd MMM yyyy HH:mm")} · {app.interviewDetails?.mode}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={app.status} />
                  <Button size="sm" variant="secondary" onClick={() => setFeedbackOpen(app.id)}>Feedback</Button>
                  <Button size="sm" variant="ghost" onClick={() => reschedule(app)}>Reschedule</Button>
                  <Button size="sm" variant="ghost" onClick={() => cancelInterview(app.id)}>Cancel</Button>
                </div>
              </li>
            );
          })}
          {!scheduled.length && <p className="text-sm text-secondary">No interviews scheduled.</p>}
        </ul>
      )}

      <Modal open={wizardOpen} onClose={() => setWizardOpen(false)} title="Schedule interview">
        <MultiStepForm steps={STEPS} current={step} onStepChange={setStep}>
          {step === 0 && (
            <Select
              label="Candidate / application"
              value={form.applicationId}
              onChange={(e) => set("applicationId", e.target.value)}
              options={[
                { value: "", label: "Select..." },
                ...shortlisted.concat(scheduled).map((a) => {
                  const c = users.find((u) => u.id === a.applicantId);
                  const o = opportunities.find((x) => x.id === a.opportunityId);
                  return { value: a.id, label: `${c?.name} — ${o?.title}` };
                }),
              ]}
            />
          )}
          {step === 1 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Date" type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
              <Input label="Time" type="time" value={form.time} onChange={(e) => set("time", e.target.value)} />
              <Select label="Mode" value={form.mode} onChange={(e) => set("mode", e.target.value)} options={[
                { value: "Onsite", label: "Onsite" },
                { value: "Remote", label: "Remote" },
                { value: "Hybrid", label: "Hybrid" },
              ]} />
              <Input label="Location / link" value={form.location} onChange={(e) => set("location", e.target.value)} />
            </div>
          )}
          {step === 2 && (
            <>
              <Input label="Lead interviewer" value={form.interviewer} onChange={(e) => set("interviewer", e.target.value)} />
              <Textarea label="Notes for candidate" rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
            </>
          )}
          {step === 3 && (
            <div className="space-y-2 text-sm">
              <p>Candidate will receive in-app and email notification (simulated).</p>
              <p>Date: {form.date} {form.time} · {form.mode}</p>
            </div>
          )}
          <div className="mt-4 flex gap-2">
            {step > 0 ? <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>Back</Button> : null}
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep((s) => s + 1)}>Next</Button>
            ) : (
              <Button onClick={scheduleInterview}>Confirm & notify</Button>
            )}
          </div>
        </MultiStepForm>
      </Modal>

      <Modal open={!!feedbackOpen} onClose={() => setFeedbackOpen(null)} title="Interview feedback">
        <Textarea rows={4} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Technical score, culture fit, recommendation..." />
        <Button className="mt-3" onClick={() => submitFeedback(feedbackOpen)}>Save feedback</Button>
      </Modal>
    </div>
  );
}
