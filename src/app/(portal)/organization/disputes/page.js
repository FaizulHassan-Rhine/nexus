"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui";
import { Button, Modal, Textarea, Select, FileUploader, StatusBadge, MultiStepForm } from "@/components/ui";
import { AuditEventList } from "@/components/domain/Domain";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { disputeService } from "@/lib/mockServices";
import { formatDate } from "@/lib/formatters";
import { toast } from "sonner";
import { getOrgDisputes, getOrgApplications } from "../_lib/helpers";

const STEPS = ["Issue", "Details", "Evidence", "Submit"];

export default function OrganizationDisputesPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const disputes = useAppStore((s) => s.disputes);
  const applications = useAppStore((s) => s.applications);
  const opportunities = useAppStore((s) => s.opportunities);
  const audit = useAppStore((s) => s.audit);

  const [wizardOpen, setWizardOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    issueType: "Candidate eligibility dispute",
    description: "",
    requestedRemedy: "",
    linkedApplicationId: "",
    evidence: null,
  });

  const mine = useMemo(() => getOrgDisputes(disputes, user?.organizationId), [disputes, user]);
  const orgApps = useMemo(
    () => getOrgApplications(applications, opportunities, user?.organizationId),
    [applications, opportunities, user]
  );

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
        organization: user?.organizationId,
        university: orgApps.find((a) => a.id === form.linkedApplicationId)?.universityId,
      },
      raisedBy: user?.id,
    });
    toast.success("Dispute filed");
    setWizardOpen(false);
    setStep(0);
    setForm({ issueType: "Candidate eligibility dispute", description: "", requestedRemedy: "", linkedApplicationId: "", evidence: null });
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Disputes"
        description="Formal cases with university and UGC oversight"
        actions={<Button onClick={() => setWizardOpen(true)}>Create dispute</Button>}
      />

      <div className="space-y-4">
        {mine.map((d) => {
          const events = audit.filter((a) => a.entityId === d.id).slice(0, 3);
          return (
            <article key={d.id} className="card-surface p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">{d.issueType}</p>
                  <p className="text-sm text-secondary">{d.description}</p>
                </div>
                <StatusBadge status={d.status} />
              </div>
              <p className="mt-2 text-xs text-secondary">Filed {formatDate(d.createdAt)}</p>
              {d.timeline?.length ? (
                <ul className="mt-3 space-y-1 text-xs text-secondary">
                  {d.timeline.map((t, i) => (
                    <li key={i}>{formatDate(t.at)} — {t.status}: {t.note}</li>
                  ))}
                </ul>
              ) : null}
              {events.length ? <AuditEventList events={events} className="mt-4" /> : null}
            </article>
          );
        })}
        {!mine.length && <p className="text-sm text-secondary">No disputes on record.</p>}
      </div>

      <Modal open={wizardOpen} onClose={() => setWizardOpen(false)} title="New dispute">
        <MultiStepForm steps={STEPS} current={step} onStepChange={setStep}>
          {step === 0 && (
            <Select
              label="Issue type"
              value={form.issueType}
              onChange={(e) => set("issueType", e.target.value)}
              options={[
                { value: "Candidate eligibility dispute", label: "Candidate eligibility" },
                { value: "Stipend payment delay", label: "Stipend payment" },
                { value: "University approval delay", label: "University approval" },
                { value: "Misrepresentation", label: "Misrepresentation" },
              ]}
            />
          )}
          {step === 1 && (
            <>
              <Select
                label="Linked application"
                value={form.linkedApplicationId}
                onChange={(e) => set("linkedApplicationId", e.target.value)}
                options={[{ value: "", label: "Optional..." }, ...orgApps.map((a) => ({ value: a.id, label: a.id }))]}
              />
              <Textarea label="Description" rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} />
              <Textarea label="Requested remedy" rows={2} value={form.requestedRemedy} onChange={(e) => set("requestedRemedy", e.target.value)} />
            </>
          )}
          {step === 2 && (
            <FileUploader label="Evidence" value={form.evidence} onChange={(v) => set("evidence", v)} onRemove={() => set("evidence", null)} />
          )}
          {step === 3 && (
            <p className="text-sm text-secondary">Dispute will be routed to university administrator and UGC oversight.</p>
          )}
          <div className="mt-4 flex gap-2">
            {step > 0 ? <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>Back</Button> : null}
            {step < STEPS.length - 1 ? <Button onClick={() => setStep((s) => s + 1)}>Next</Button> : <Button onClick={submitDispute}>Submit dispute</Button>}
          </div>
        </MultiStepForm>
      </Modal>
    </div>
  );
}
