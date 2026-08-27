"use client";

import { useMemo, useState } from "react";
import { PageHeader, FilterBar, Select, DataTable, Button, StatusBadge, Modal, Textarea } from "@/components/ui";
import { FundingSplitCard, PaymentMilestones } from "@/components/domain/Domain";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { formatCurrency } from "@/lib/formatters";
import { toast } from "sonner";
import { getUniversityId } from "../_lib/helpers";

export default function FundingPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const uniId = getUniversityId(user);
  const funding = useAppStore((s) => s.funding);
  const users = useAppStore((s) => s.users);
  const reviewFundingRequest = useAppStore((s) => s.reviewFundingRequest);
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");

  const mine = useMemo(() => funding.filter((f) => f.universityId === uniId), [funding, uniId]);
  const filtered = mine.filter((f) => status === "all" || f.status === status || f.universityVerification?.status === status);

  const verify = (approve) => {
    if (!selected) return;
    reviewFundingRequest(selected.id, approve ? "Under UGC review" : "Rejected", {
      note,
      universityVerification: { status: approve ? "Approved" : "Rejected", verifiedBy: user?.id, at: new Date().toISOString() },
    });
    toast.success(approve ? "Verified — forwarded to UGC" : "Rejected");
    setSelected(null);
    setNote("");
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Funding" description="Verify need-based documentation and co-funded internship requests" />
      <FilterBar>
        <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} options={[{ value: "all", label: "All" }, { value: "University verification", label: "Pending verification" }, { value: "Approved", label: "Approved" }, { value: "Under UGC review", label: "At UGC" }]} />
      </FilterBar>
      <DataTable
        columns={[
          { key: "id", label: "Request" },
          { key: "programme", label: "Programme" },
          { key: "student", label: "Student", render: (r) => users.find((u) => u.id === r.studentId)?.name },
          { key: "requestedAmount", label: "Amount", render: (r) => formatCurrency(r.requestedAmount) },
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
            <Textarea label="Verification note" value={note} onChange={(e) => setNote(e.target.value)} />
            <div className="flex gap-2">
              <Button onClick={() => verify(true)}>Verify need & approve</Button>
              <Button variant="danger" onClick={() => verify(false)}>Reject</Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
