"use client";

import { useMemo, useState } from "react";
import { PageHeader, DataTable, Button, StatusBadge, Modal, Textarea, Select } from "@/components/ui";
import { ApplicationTimeline } from "@/components/domain/Domain";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { toast } from "sonner";
import { DISPUTE_STAGES } from "../_lib/helpers";

const STAGE_FLOW = ["Intake", "Under university review", "Under UGC review", "Investigation", "Mediation", "Resolved"];

export default function UgcDisputesPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const disputes = useAppStore((s) => s.disputes);
  const users = useAppStore((s) => s.users);
  const updateDispute = useAppStore((s) => s.updateDispute);
  const resolveDispute = useAppStore((s) => s.resolveDispute);
  const [selected, setSelected] = useState(null);
  const [stage, setStage] = useState("");
  const [note, setNote] = useState("");

  const escalated = useMemo(() => disputes.filter((d) => !["Closed"].includes(d.status)), [disputes]);

  const advance = () => {
    if (!selected || !stage) return;
    updateDispute(selected.id, { status: stage, note, assignedOfficer: user?.id });
    if (stage === "Resolved") resolveDispute(selected.id, { summary: note || "Resolved by UGC" });
    toast.success(`Moved to ${stage}`);
    setSelected(null);
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Disputes" description="National dispute system — Intake through Resolved" />
      <DataTable
        columns={[
          { key: "id", label: "ID" },
          { key: "issueType", label: "Issue" },
          { key: "student", label: "Student", render: (r) => users.find((u) => u.id === r.parties?.student)?.name },
          { key: "status", label: "Stage", render: (r) => <StatusBadge status={r.status} /> },
          { key: "officer", label: "Officer", render: (r) => users.find((u) => u.id === r.assignedOfficer)?.name || "—" },
          { key: "actions", label: "", render: (r) => <Button size="sm" onClick={() => { setSelected(r); setStage(r.status); }}>Manage</Button> },
        ]}
        rows={escalated.map((d) => ({ ...d, id: d.id }))}
      />
      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.id}>
        {selected ? (
          <div className="space-y-4 text-sm">
            <p>{selected.description}</p>
            <Select label="Stage" value={stage} onChange={(e) => setStage(e.target.value)} options={STAGE_FLOW} />
            <Textarea label="Action note" value={note} onChange={(e) => setNote(e.target.value)} />
            {selected.timeline || selected.auditHistory ? (
              <ApplicationTimeline events={(selected.timeline || selected.auditHistory || []).map((e) => ({ at: e.at, status: e.status || e.action, note: e.note }))} />
            ) : null}
            <Button onClick={advance}>Update stage</Button>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
