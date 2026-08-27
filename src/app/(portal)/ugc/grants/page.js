"use client";

import { PageHeader, DataTable, StatusBadge, Badge } from "@/components/ui";
import { PaymentMilestones } from "@/components/domain/Domain";
import { useAppStore } from "@/store/useAppStore";
import { useHydrated } from "@/hooks/useApp";
import { formatCurrency } from "@/lib/formatters";

export default function GrantsPage() {
  const hydrated = useHydrated();
  const funding = useAppStore((s) => s.funding);
  const programmes = useAppStore((s) => s.programmes);
  const payments = useAppStore((s) => s.payments);

  const grants = funding.filter((f) => f.programme?.includes("Grant") || f.programme?.includes("Research"));
  const researchProg = programmes.find((p) => p.name.includes("Research"));

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Grants" description="Faculty research grants and innovation matching disbursements" />
      {researchProg ? (
        <div className="card-surface p-4">
          <p className="font-semibold">{researchProg.name}</p>
          <p className="text-sm text-secondary">{formatCurrency(researchProg.used)} of {formatCurrency(researchProg.budget)} disbursed</p>
        </div>
      ) : null}
      <DataTable
        columns={[
          { key: "id", label: "Grant ID" },
          { key: "programme", label: "Programme" },
          { key: "amount", label: "Amount", render: (r) => formatCurrency(r.approvedAmount || r.requestedAmount) },
          { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
          { key: "payment", label: "Payment", render: (r) => <Badge tone="teal">{r.paymentStatus || "—"}</Badge> },
        ]}
        rows={(grants.length ? grants : funding.slice(0, 8)).map((g) => ({ ...g, id: g.id }))}
      />
      <div className="card-surface p-4">
        <h3 className="font-semibold">Recent payments</h3>
        <PaymentMilestones milestones={payments.slice(0, 5).map((p) => ({ label: p.id, amount: p.amount, status: p.status, dueDate: p.createdAt }))} />
      </div>
    </div>
  );
}
