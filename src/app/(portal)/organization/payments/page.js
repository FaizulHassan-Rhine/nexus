"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui";
import { Button, Input, Select, Modal, StatusBadge, MultiStepForm } from "@/components/ui";
import { PaymentMilestones } from "@/components/domain/Domain";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { fundingService } from "@/lib/mockServices";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { toast } from "sonner";
import { getOrgFunding, getOrgPayments } from "../_lib/helpers";

const STEPS = ["Funding request", "Milestone", "Amount", "Confirm"];

export default function PaymentsPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const funding = useAppStore((s) => s.funding);
  const payments = useAppStore((s) => s.payments);
  const users = useAppStore((s) => s.users);

  const [recordOpen, setRecordOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    fundingRequestId: "",
    milestoneId: "",
    amount: 9000,
    currency: "BDT",
    status: "Paid",
    reference: "",
  });

  const orgFunding = useMemo(() => getOrgFunding(funding, user?.organizationId), [funding, user]);
  const orgPayments = useMemo(() => getOrgPayments(payments, user?.organizationId, funding), [payments, user, funding]);

  const selectedFund = orgFunding.find((f) => f.id === form.fundingRequestId);
  const milestones = selectedFund?.milestones || [];

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const record = async () => {
    if (!form.fundingRequestId || !form.amount) {
      toast.error("Complete all fields");
      return;
    }
    await fundingService.recordPayment({
      ...form,
      organizationId: user?.organizationId,
      studentId: selectedFund?.studentId,
      amount: Number(form.amount),
    });
    toast.success("Payment milestone recorded");
    setRecordOpen(false);
    setStep(0);
  };

  const reportIssue = (paymentId) => {
    toast.message("Payment issue reported to finance team");
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Payments"
        description="Stipend, co-funding, and milestone payment records"
        actions={<Button onClick={() => setRecordOpen(true)}>Record payment</Button>}
      />

      {orgFunding.map((f) => {
        const student = users.find((u) => u.id === f.studentId);
        return (
          <section key={f.id} className="card-surface p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold">{f.programme}</p>
                <p className="text-sm text-secondary">{student?.name} · {formatCurrency(f.requestedAmount)}</p>
              </div>
              <StatusBadge status={f.paymentStatus || f.status} />
            </div>
            <PaymentMilestones milestones={f.milestones || []} className="mt-4" />
          </section>
        );
      })}

      <section>
        <h2 className="text-lg font-semibold">Payment history</h2>
        <ul className="mt-3 space-y-2">
          {orgPayments.map((p) => (
            <li key={p.id} className="card-surface flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
              <div>
                <p className="font-medium">{formatCurrency(p.amount, p.currency)}</p>
                <p className="text-xs text-secondary">{formatDate(p.createdAt)} · Ref {p.reference || p.id}</p>
              </div>
              <div className="flex gap-2">
                <StatusBadge status={p.status} />
                <Button size="sm" variant="ghost" onClick={() => reportIssue(p.id)}>Report issue</Button>
              </div>
            </li>
          ))}
          {!orgPayments.length && <p className="text-sm text-secondary">No payment records yet.</p>}
        </ul>
      </section>

      <Modal open={recordOpen} onClose={() => setRecordOpen(false)} title="Record payment milestone">
        <MultiStepForm steps={STEPS} current={step} onStepChange={setStep}>
          {step === 0 && (
            <Select
              label="Co-funding request"
              value={form.fundingRequestId}
              onChange={(e) => set("fundingRequestId", e.target.value)}
              options={[{ value: "", label: "Select..." }, ...orgFunding.map((f) => ({ value: f.id, label: `${f.programme} (${f.status})` }))]}
            />
          )}
          {step === 1 && (
            <Select
              label="Milestone"
              value={form.milestoneId}
              onChange={(e) => {
                const m = milestones.find((x) => x.id === e.target.value);
                set("milestoneId", e.target.value);
                if (m) set("amount", m.amount);
              }}
              options={[{ value: "", label: "Select..." }, ...milestones.map((m) => ({ value: m.id, label: `${m.label} — ${formatCurrency(m.amount)}` }))]}
            />
          )}
          {step === 2 && (
            <>
              <Input label="Amount" type="number" value={form.amount} onChange={(e) => set("amount", e.target.value)} />
              <Input label="Reference" value={form.reference} onChange={(e) => set("reference", e.target.value)} placeholder="Bank ref / invoice" />
              <Select label="Status" value={form.status} onChange={(e) => set("status", e.target.value)} options={[
                { value: "Paid", label: "Paid" },
                { value: "Scheduled", label: "Scheduled" },
                { value: "Pending", label: "Pending" },
              ]} />
            </>
          )}
          {step === 3 && (
            <p className="text-sm">Record {formatCurrency(form.amount)} against milestone {form.milestoneId || "—"}?</p>
          )}
          <div className="mt-4 flex gap-2">
            {step > 0 ? <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>Back</Button> : null}
            {step < STEPS.length - 1 ? <Button onClick={() => setStep((s) => s + 1)}>Next</Button> : <Button onClick={record}>Record payment</Button>}
          </div>
        </MultiStepForm>
      </Modal>
    </div>
  );
}
