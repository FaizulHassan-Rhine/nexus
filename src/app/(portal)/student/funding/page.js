"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui";
import { Button, Input, Textarea, Select, MultiStepForm, FileUploader, StatusBadge } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { fundingService } from "@/lib/mockServices";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { toast } from "sonner";

const STEPS = ["Type", "Details", "Documents", "Review"];

export default function FundingPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const funding = useAppStore((s) => s.funding);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    requestType: "Need-based stipend",
    programme: "UGC Co-Funded Internship Stipend Programme",
    requestedAmount: 36000,
    duration: "4 months",
    justification: "",
    documents: [],
  });

  const userFunding = funding.filter((f) => f.studentId === user?.id);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async () => {
    setSubmitting(true);
    try {
      await fundingService.submit({
        ...form,
        totalStipend: form.requestedAmount / 4,
        companySharePercent: 50,
        ugcSharePercent: 50,
        supportingDocuments: form.documents,
      });
      toast.success("Funding request submitted");
      setStep(0);
      setForm({ ...form, justification: "", documents: [] });
    } finally {
      setSubmitting(false);
    }
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Funding requests"
        description="Apply for need-based stipends, project grants, and UGC co-funding"
      />

      {userFunding.length ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Your requests</h2>
          {userFunding.map((f) => (
            <article key={f.id} className="card-surface p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{f.programme || f.requestType}</p>
                  <p className="text-sm text-secondary">Requested {formatCurrency(f.requestedAmount || f.totalStipend * 4)}</p>
                </div>
                <StatusBadge status={f.status} />
              </div>
              <p className="mt-2 text-xs text-secondary">Submitted {formatDate(f.createdAt)}</p>
            </article>
          ))}
        </section>
      ) : null}

      <section className="card-surface p-4">
        <h2 className="text-lg font-semibold">New funding request</h2>
        <MultiStepForm steps={STEPS} current={step} onStepChange={setStep}>
          {step === 0 ? (
            <Select
              label="Request type"
              value={form.requestType}
              onChange={(e) => set("requestType", e.target.value)}
              options={[
                "Need-based stipend",
                "Project grant",
                "Innovation matching grant",
                "Certification voucher",
                "Emergency support",
              ]}
            />
          ) : null}
          {step === 1 ? (
            <div className="space-y-4">
              <Input label="Programme" value={form.programme} onChange={(e) => set("programme", e.target.value)} />
              <Input
                label="Total requested (BDT)"
                type="number"
                value={form.requestedAmount}
                onChange={(e) => set("requestedAmount", Number(e.target.value))}
              />
              <Input label="Duration" value={form.duration} onChange={(e) => set("duration", e.target.value)} />
              <Textarea
                label="Justification"
                rows={4}
                value={form.justification}
                onChange={(e) => set("justification", e.target.value)}
              />
            </div>
          ) : null}
          {step === 2 ? (
            <FileUploader
              label="Supporting document"
              value={form.documents[0]}
              onChange={(file) => set("documents", [file])}
              onRemove={() => set("documents", [])}
            />
          ) : null}
          {step === 3 ? (
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt>Type</dt><dd>{form.requestType}</dd></div>
              <div className="flex justify-between"><dt>Amount</dt><dd>{formatCurrency(form.requestedAmount)}</dd></div>
              <div className="flex justify-between"><dt>Duration</dt><dd>{form.duration}</dd></div>
              <div><dt className="text-secondary">Justification</dt><dd className="mt-1">{form.justification || "—"}</dd></div>
            </dl>
          ) : null}
          <div className="mt-6 flex justify-between">
            <Button variant="secondary" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>Back</Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep((s) => s + 1)}>Next</Button>
            ) : (
              <Button loading={submitting} onClick={submit}>Submit request</Button>
            )}
          </div>
        </MultiStepForm>
      </section>
    </div>
  );
}
