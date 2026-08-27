"use client";

import { useMemo, useState } from "react";
import { PageHeader, FilterBar, Select, DataTable, Button, StatusBadge, Modal, Textarea } from "@/components/ui";
import { FundingSplitCard, PaymentMilestones } from "@/components/domain/Domain";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { formatCurrency } from "@/lib/formatters";
import { toast } from "sonner";
import { cofundingQueue } from "../_lib/helpers";

export default function CoFundingPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const funding = useAppStore((s) => s.funding);
  const users = useAppStore((s) => s.users);
  const universities = useAppStore((s) => s.universities);
  const reviewFundingRequest = useAppStore((s) => s.reviewFundingRequest);
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");

  const queue = useMemo(() => cofundingQueue(funding), [funding]);
  const filtered = queue.filter((f) => status === "all" || f.status === status);
  const uniMap = Object.fromEntries(universities.map((u) => [u.id, u]));

  const review = (decision) => {
    if (!selected) return;
    const statusMap = {
      approve: "Active",
      conditions: "Approved with conditions",
      changes: "Changes requested",
      reject: "Rejected",
    };
    reviewFundingRequest(selected.id, statusMap[decision], {
      note,
      ugcReview: { status: statusMap[decision], reviewer: user?.id, at: new Date().toISOString() },
      approvedAmount: decision === "approve" || decision === "conditions" ? selected.requestedAmount : null,
    });
    toast.success(`Decision: ${statusMap[decision]}`);
    setSelected(null);
    setNote("");
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Co-funding review" description={`${queue.length} requests in national queue`} />
      <FilterBar>
        <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} options={[{ value: "all", label: "All" }, { value: "Under UGC review", label: "Under review" }, { value: "University verification", label: "Awaiting university" }]} />
      </FilterBar>
      <DataTable
        columns={[
          { key: "id", label: "Request" },
          { key: "student", label: "Student", render: (r) => users.find((u) => u.id === r.studentId)?.name },
          { key: "uni", label: "University", render: (r) => uniMap[r.universityId]?.shortName },
          { key: "amount", label: "Amount", render: (r) => formatCurrency(r.requestedAmount) },
          { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
          { key: "uv", label: "University", render: (r) => <StatusBadge status={r.universityVerification?.status || "Pending"} /> },
          { key: "actions", label: "", render: (r) => <Button size="sm" onClick={() => setSelected(r)}>Review</Button> },
        ]}
        rows={filtered.map((f) => ({ ...f, id: f.id }))}
      />
      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={`Review ${selected?.id}`}>
        {selected ? (
          <div className="space-y-4">
            <FundingSplitCard companyShare={selected.companySharePercent || 50} ugcShare={selected.ugcSharePercent || 50} total={selected.requestedAmount} />
            <PaymentMilestones milestones={selected.milestones || []} />
            <Textarea label="Decision note" value={note} onChange={(e) => setNote(e.target.value)} />
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => review("approve")}>Approve</Button>
              <Button variant="secondary" onClick={() => review("conditions")}>Approve with conditions</Button>
              <Button variant="outline" onClick={() => review("changes")}>Request changes</Button>
              <Button variant="danger" onClick={() => review("reject")}>Reject</Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
