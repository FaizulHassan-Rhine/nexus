"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui";
import {
  Button,
  Input,
  Textarea,
  Select,
  Modal,
  MultiStepForm,
  StatusBadge,
  Checkbox,
} from "@/components/ui";
import { FundingSplitCard, PaymentMilestones, ApplicationTimeline } from "@/components/domain/Domain";
import { AuditEventList } from "@/components/domain/Domain";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { fundingService } from "@/lib/mockServices";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { percentPair } from "@/lib/validators";
import { toast } from "sonner";
import { getOrgFunding, getOrgOpportunities, getOrgApplications } from "../_lib/helpers";

const STEPS = [
  "Opportunity & candidate",
  "Total stipend",
  "Funding split",
  "Duration & milestones",
  "Justification",
  "Compliance",
  "Submit",
];

export default function CoFundingPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const funding = useAppStore((s) => s.funding);
  const opportunities = useAppStore((s) => s.opportunities);
  const applications = useAppStore((s) => s.applications);
  const users = useAppStore((s) => s.users);
  const audit = useAppStore((s) => s.audit);

  const [wizardOpen, setWizardOpen] = useState(false);
  const [detailId, setDetailId] = useState(null);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    opportunityId: "",
    applicationId: "",
    studentId: "",
    totalStipend: 18000,
    duration: "4 months",
    companySharePercent: 50,
    ugcSharePercent: 50,
    requestedAmount: 72000,
    justification: "",
    complianceConfirmed: false,
    milestones: [
      { label: "Month 1", amount: 9000, dueDate: "2026-10-01" },
      { label: "Month 2", amount: 9000, dueDate: "2026-11-01" },
      { label: "Month 3", amount: 9000, dueDate: "2026-12-01" },
      { label: "Month 4", amount: 9000, dueDate: "2027-01-01" },
    ],
  });

  const orgFunding = useMemo(() => getOrgFunding(funding, user?.organizationId), [funding, user]);
  const orgOpps = useMemo(
    () => getOrgOpportunities(opportunities, user?.organizationId).filter((o) => o.ugcProgrammeId),
    [opportunities, user]
  );
  const orgApps = useMemo(
    () => getOrgApplications(applications, opportunities, user?.organizationId),
    [applications, opportunities, user]
  );

  const detail = orgFunding.find((f) => f.id === detailId);
  const detailAudit = audit.filter((a) => a.entityId === detailId || detail?.auditEventIds?.includes(a.id)).slice(0, 5);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const onSelectApp = (appId) => {
    const app = orgApps.find((a) => a.id === appId);
    if (!app) return;
    const opp = opportunities.find((o) => o.id === app.opportunityId);
    setForm((f) => ({
      ...f,
      applicationId: appId,
      opportunityId: app.opportunityId,
      studentId: app.applicantId,
      totalStipend: opp?.compensation?.amount || 18000,
      requestedAmount: (opp?.compensation?.amount || 18000) * 4,
    }));
  };

  const submit = async () => {
    const err = percentPair(form.companySharePercent, form.ugcSharePercent);
    if (err) {
      toast.error(err);
      return;
    }
    if (!form.complianceConfirmed) {
      toast.error("Confirm compliance declaration");
      return;
    }
    const companyShareAmount = Math.round((form.requestedAmount * form.companySharePercent) / 100);
    const ugcShareAmount = form.requestedAmount - companyShareAmount;
    await fundingService.submit({
      programme: "UGC Co-Funded Internship Stipend Programme",
      programmeId: "ugc-cofund-2025",
      opportunityId: form.opportunityId,
      applicationId: form.applicationId,
      studentId: form.studentId,
      organizationId: user?.organizationId,
      totalStipend: form.totalStipend,
      companySharePercent: form.companySharePercent,
      ugcSharePercent: form.ugcSharePercent,
      companyShareAmount,
      ugcShareAmount,
      duration: form.duration,
      requestedAmount: form.requestedAmount,
      justification: form.justification,
      milestones: form.milestones.map((m, i) => ({ ...m, id: `ms-new-${i}`, status: "Pending" })),
    });
    toast.success("Co-funding request submitted for university verification");
    setWizardOpen(false);
    setStep(0);
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-8">
      <PageHeader
        title="UGC co-funding"
        description="Apply for stipend co-funding on eligible internships"
        actions={<Button onClick={() => setWizardOpen(true)}>New co-funding request</Button>}
      />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Your requests</h2>
        {orgFunding.map((f) => {
          const student = users.find((u) => u.id === f.studentId);
          const opp = opportunities.find((o) => o.id === f.opportunityId);
          return (
            <article key={f.id} className="card-surface p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{opp?.title || f.programme}</p>
                  <p className="text-sm text-secondary">{student?.name} · {formatCurrency(f.requestedAmount)}</p>
                </div>
                <div className="flex gap-2">
                  <StatusBadge status={f.status} />
                  <Button size="sm" variant="secondary" onClick={() => setDetailId(f.id)}>Details</Button>
                </div>
              </div>
              <FundingSplitCard
                className="mt-3"
                companyShare={f.companySharePercent}
                ugcShare={f.ugcSharePercent}
                total={f.requestedAmount}
              />
            </article>
          );
        })}
        {!orgFunding.length && <p className="text-sm text-secondary">No co-funding requests yet.</p>}
      </section>

      <Modal open={wizardOpen} onClose={() => setWizardOpen(false)} title="Co-funding wizard" size="lg">
        <MultiStepForm steps={STEPS} current={step} onStepChange={setStep}>
          {step === 0 && (
            <>
              <Select
                label="Eligible opportunity"
                value={form.opportunityId}
                onChange={(e) => set("opportunityId", e.target.value)}
                options={[{ value: "", label: "Select..." }, ...orgOpps.map((o) => ({ value: o.id, label: o.title }))]}
              />
              <Select
                label="Candidate application"
                value={form.applicationId}
                onChange={(e) => onSelectApp(e.target.value)}
                options={[
                  { value: "", label: "Select..." },
                  ...orgApps.filter((a) => !form.opportunityId || a.opportunityId === form.opportunityId).map((a) => {
                    const c = users.find((u) => u.id === a.applicantId);
                    return { value: a.id, label: `${c?.name} (${a.status})` };
                  }),
                ]}
              />
            </>
          )}
          {step === 1 && (
            <>
              <Input label="Monthly stipend (BDT)" type="number" value={form.totalStipend} onChange={(e) => {
                const v = Number(e.target.value);
                set("totalStipend", v);
                set("requestedAmount", v * 4);
              }} />
              <Input label="Total requested (duration)" type="number" value={form.requestedAmount} onChange={(e) => set("requestedAmount", e.target.value)} />
              <Input label="Duration" value={form.duration} onChange={(e) => set("duration", e.target.value)} />
            </>
          )}
          {step === 2 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Company %" type="number" value={form.companySharePercent} onChange={(e) => {
                  const v = Number(e.target.value);
                  set("companySharePercent", v);
                  set("ugcSharePercent", 100 - v);
                }} />
                <Input label="UGC %" type="number" value={form.ugcSharePercent} onChange={(e) => {
                  const v = Number(e.target.value);
                  set("ugcSharePercent", v);
                  set("companySharePercent", 100 - v);
                }} />
              </div>
              <FundingSplitCard companyShare={form.companySharePercent} ugcShare={form.ugcSharePercent} total={form.requestedAmount} />
              {percentPair(form.companySharePercent, form.ugcSharePercent) ? (
                <p className="text-sm text-danger">{percentPair(form.companySharePercent, form.ugcSharePercent)}</p>
              ) : null}
            </>
          )}
          {step === 3 && (
            <div className="space-y-2">
              {form.milestones.map((m, i) => (
                <div key={i} className="grid gap-2 sm:grid-cols-3">
                  <Input value={m.label} onChange={(e) => {
                    const ms = [...form.milestones];
                    ms[i] = { ...ms[i], label: e.target.value };
                    set("milestones", ms);
                  }} />
                  <Input type="number" value={m.amount} onChange={(e) => {
                    const ms = [...form.milestones];
                    ms[i] = { ...ms[i], amount: Number(e.target.value) };
                    set("milestones", ms);
                  }} />
                  <Input type="date" value={m.dueDate} onChange={(e) => {
                    const ms = [...form.milestones];
                    ms[i] = { ...ms[i], dueDate: e.target.value };
                    set("milestones", ms);
                  }} />
                </div>
              ))}
            </div>
          )}
          {step === 4 && (
            <Textarea label="Justification" rows={4} value={form.justification} onChange={(e) => set("justification", e.target.value)} placeholder="Why co-funding is needed, candidate merit, regional impact..." />
          )}
          {step === 5 && (
            <Checkbox
              label="I confirm this request complies with UGC co-funding guidelines and university internship policies"
              checked={form.complianceConfirmed}
              onChange={(v) => set("complianceConfirmed", v)}
            />
          )}
          {step === 6 && (
            <div className="text-sm space-y-2">
              <p>Total: {formatCurrency(form.requestedAmount)} over {form.duration}</p>
              <p>Split: {form.companySharePercent}% / {form.ugcSharePercent}%</p>
              <p>Route: University verification → UGC review</p>
            </div>
          )}
          <div className="mt-4 flex gap-2">
            {step > 0 ? <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>Back</Button> : null}
            {step < STEPS.length - 1 ? <Button onClick={() => setStep((s) => s + 1)}>Next</Button> : <Button onClick={submit}>Submit request</Button>}
          </div>
        </MultiStepForm>
      </Modal>

      <Modal open={!!detail} onClose={() => setDetailId(null)} title="Co-funding detail" size="lg">
        {detail ? (
          <div className="space-y-4">
            <StatusBadge status={detail.status} />
            <FundingSplitCard companyShare={detail.companySharePercent} ugcShare={detail.ugcSharePercent} total={detail.requestedAmount} />
            {detail.approvedAmount ? <p className="text-sm">Approved: {formatCurrency(detail.approvedAmount)}</p> : null}
            <div>
              <h4 className="font-medium">Review timeline</h4>
              <ApplicationTimeline events={(detail.timeline || []).map((e) => ({ status: e.status, at: e.at, note: e.note }))} />
            </div>
            <div>
              <h4 className="font-medium">Payment milestones</h4>
              <PaymentMilestones milestones={detail.milestones || []} />
            </div>
            {detailAudit.length ? (
              <div>
                <h4 className="font-medium">Audit log</h4>
                <AuditEventList events={detailAudit} />
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
