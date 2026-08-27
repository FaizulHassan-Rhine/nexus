"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui";
import { Button, Modal, Textarea, Select } from "@/components/ui";
import { FundingSplitCard, PaymentMilestones } from "@/components/domain/Domain";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { disputeService } from "@/lib/mockServices";
import { downloadCsv } from "@/lib/exporters";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { toast } from "sonner";

export default function FinancePage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const funding = useAppStore((s) => s.funding);
  const payments = useAppStore((s) => s.payments);

  const [issueOpen, setIssueOpen] = useState(false);
  const [issueDesc, setIssueDesc] = useState("");
  const [issueType, setIssueType] = useState("Stipend payment delay");

  const userFunding = useMemo(
    () => funding.filter((f) => f.studentId === user?.id),
    [funding, user]
  );
  const userPayments = useMemo(
    () => payments.filter((p) => p.studentId === user?.id || userFunding.some((f) => f.id === p.fundingId)),
    [payments, userFunding, user]
  );

  const primary = userFunding[0];

  const downloadStatement = () => {
    const rows = [
      ...(primary?.milestones || []).map((m) => ({
        label: m.label,
        amount: m.amount,
        dueDate: m.dueDate,
        status: m.status,
      })),
      ...userPayments.map((p) => ({
        label: p.label || p.id,
        amount: p.amount,
        dueDate: p.paidAt || p.createdAt,
        status: p.status,
      })),
    ];
    downloadCsv("nexus-finance-statement", rows, [
      { key: "label", label: "Description" },
      { key: "amount", label: "Amount (BDT)" },
      { key: "dueDate", label: "Date" },
      { key: "status", label: "Status" },
    ]);
    toast.success("Statement downloaded");
  };

  const reportIssue = async () => {
    if (!issueDesc.trim()) {
      toast.error("Describe the issue");
      return;
    }
    await disputeService.create({
      issueType: issueType,
      description: issueDesc,
      linkedFundingId: primary?.id,
      parties: { student: user?.id, organization: primary?.organizationId, university: user?.universityId },
    });
    toast.success("Issue reported — see Disputes");
    setIssueOpen(false);
    setIssueDesc("");
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Finance"
        description="Stipend splits, payment milestones, and statements"
        actions={
          <>
            <Button variant="secondary" onClick={downloadStatement}>Download statement CSV</Button>
            <Button variant="outline" onClick={() => setIssueOpen(true)}>Report issue</Button>
          </>
        }
      />

      {primary ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <FundingSplitCard
            companyShare={primary.companySharePercent || 50}
            ugcShare={primary.ugcSharePercent || 50}
            total={(primary.totalStipend || 0) * 4}
          />
          <div className="card-surface p-4">
            <h3 className="font-semibold">{primary.programme}</h3>
            <p className="mt-1 text-sm text-secondary">Status: {primary.status}</p>
            <p className="text-sm text-secondary">Monthly stipend: {formatCurrency(primary.totalStipend)}</p>
            <div className="mt-4">
              <h4 className="text-sm font-medium">Payment milestones</h4>
              <PaymentMilestones milestones={primary.milestones || []} className="mt-2" />
            </div>
          </div>
        </div>
      ) : (
        <p className="text-secondary">No active funding. Apply from the Funding page.</p>
      )}

      {userPayments.length ? (
        <section className="card-surface p-4">
          <h3 className="font-semibold">Payment history</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {userPayments.map((p) => (
              <li key={p.id} className="flex justify-between border-b border-slate-100 py-2 dark:border-slate-800">
                <span>{p.label || p.id}</span>
                <span>{formatCurrency(p.amount)} · {p.status} · {formatDate(p.paidAt || p.createdAt)}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <Modal open={issueOpen} onClose={() => setIssueOpen(false)} title="Report payment issue">
        <Select
          label="Issue type"
          value={issueType}
          onChange={(e) => setIssueType(e.target.value)}
          options={["Stipend payment delay", "Incorrect amount", "Missing milestone", "Other"]}
        />
        <Textarea className="mt-4" rows={4} value={issueDesc} onChange={(e) => setIssueDesc(e.target.value)} />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setIssueOpen(false)}>Cancel</Button>
          <Button onClick={reportIssue}>Submit</Button>
        </div>
      </Modal>
    </div>
  );
}
