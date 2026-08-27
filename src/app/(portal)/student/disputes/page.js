"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui";
import { Button, Modal, Textarea, Select, FileUploader, StatusBadge, MultiStepForm } from "@/components/ui";
import { AuditEventList } from "@/components/domain/Domain";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { disputeService } from "@/lib/mockServices";
import { formatDate } from "@/lib/formatters";
import { toast } from "sonner";

const STEPS = ["Issue", "Details", "Evidence", "Submit"];

export default function DisputesPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const disputes = useAppStore((s) => s.disputes);
  const applications = useAppStore((s) => s.applications);

  const [wizardOpen, setWizardOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    issueType: "Stipend payment delay",
    description: "",
    requestedRemedy: "",
    linkedApplicationId: "",
    evidence: null,
  });

  const mine = useMemo(
    () =>
      disputes.filter(
        (d) => d.raisedBy === user?.id || d.parties?.student === user?.id
      ),
    [disputes, user]
  );

  const myApps = applications.filter((a) => a.applicantId === user?.id);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const submitDispute = async () => {
    if (!form.description.trim()) {
      toast.error("Description required");
      return;
    }
    await disputeService.create({
      ...form,
      evidence: form.evidence ? [{ name: form.evidence.name, uploadedBy: user?.id, at: new Date().toISOString() }] : [],
      parties: {
        student: user?.id,
        university: user?.universityId,
      },
    });
    toast.success("Dispute created");
    setWizardOpen(false);
    setStep(0);
    setForm({ issueType: "Stipend payment delay", description: "", requestedRemedy: "", linkedApplicationId: "", evidence: null });
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Disputes"
        description="File and track formal disputes with university and UGC oversight"
        actions={<Button onClick={() => setWizardOpen(true)}>Create dispute</Button>}
      />

      <div className="space-y-4">
        {mine.map((d) => (
          <article key={d.id} className="card-surface p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold">{d.issueType}</p>
                <p className="text-sm text-secondary">{d.description}</p>
              </div>
              <StatusBadge status={d.status} />
            </div>
            <p className="mt-2 text-xs text-secondary">Filed {formatDate(d.createdAt)}</p>
            {d.linkedApplicationId ? (
              <Link href={`/student/applications/${d.linkedApplicationId}`} className="mt-2 inline-block text-sm text-nexus-700">
                View linked application
              </Link>
            ) : null}
            {d.resolution ? (
              <p className="mt-2 rounded-lg bg-green-50 p-2 text-sm dark:bg-green-950/40">{d.resolution.summary}</p>
            ) : null}
            {d.timeline?.length ? (
              <div className="mt-4">
                <AuditEventList events={d.timeline.map((t) => ({ id: t.at, action: t.status, details: t.note, timestamp: t.at }))} />
              </div>
            ) : null}
          </article>
        ))}
        {!mine.length && <p className="text-secondary">No disputes on file.</p>}
      </div>

      <Modal open={wizardOpen} onClose={() => setWizardOpen(false)} title="Create dispute" size="lg">
        <MultiStepForm steps={STEPS} current={step} onStepChange={setStep}>
          {step === 0 ? (
            <Select
              label="Issue type"
              value={form.issueType}
              onChange={(e) => set("issueType", e.target.value)}
              options={[
                "Stipend payment delay",
                "Unsafe working conditions",
                "Application process unfairness",
                "Rejection feedback inadequate",
                "Other",
              ]}
            />
          ) : null}
          {step === 1 ? (
            <div className="space-y-4">
              <Select
                label="Linked application (optional)"
                value={form.linkedApplicationId}
                onChange={(e) => set("linkedApplicationId", e.target.value)}
                placeholder="None"
                options={myApps.map((a) => ({ value: a.id, label: a.id }))}
              />
              <Textarea label="Description" rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} />
              <Textarea label="Requested remedy" rows={2} value={form.requestedRemedy} onChange={(e) => set("requestedRemedy", e.target.value)} />
            </div>
          ) : null}
          {step === 2 ? (
            <FileUploader
              label="Evidence (optional)"
              value={form.evidence}
              onChange={(f) => set("evidence", f)}
              onRemove={() => set("evidence", null)}
            />
          ) : null}
          {step === 3 ? (
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt>Type</dt><dd>{form.issueType}</dd></div>
              <div><dt className="text-secondary">Description</dt><dd>{form.description}</dd></div>
              <div><dt className="text-secondary">Remedy</dt><dd>{form.requestedRemedy || "—"}</dd></div>
            </dl>
          ) : null}
          <div className="mt-6 flex justify-between">
            <Button variant="secondary" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>Back</Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep((s) => s + 1)}>Next</Button>
            ) : (
              <Button onClick={submitDispute}>Submit dispute</Button>
            )}
          </div>
        </MultiStepForm>
      </Modal>
    </div>
  );
}
