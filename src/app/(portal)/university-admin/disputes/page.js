"use client";

import { useMemo, useState } from "react";
import { PageHeader, DataTable, Button, StatusBadge, Modal, Textarea, Select } from "@/components/ui";
import { ApplicationTimeline } from "@/components/domain/Domain";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { toast } from "sonner";
import { getUniversityId, universityDisputes } from "../_lib/helpers";

export default function DisputesPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const uniId = getUniversityId(user);
  const disputes = useAppStore((s) => s.disputes);
  const users = useAppStore((s) => s.users);
  const updateDispute = useAppStore((s) => s.updateDispute);
  const resolveDispute = useAppStore((s) => s.resolveDispute);
  const [selected, setSelected] = useState(null);
  const [decision, setDecision] = useState("Partially upheld");
  const [note, setNote] = useState("");

  const mine = useMemo(() => disputes.filter((d) => d.parties?.university === uniId), [disputes, uniId]);
  const open = universityDisputes(disputes, uniId);

  const mediate = () => {
    if (!selected || !note.trim()) {
      toast.error("Decision note required");
      return;
    }
    updateDispute(selected.id, {
      status: decision === "Escalate to UGC" ? "Under UGC review" : "Resolved",
      universityDecision: { decision, note, at: new Date().toISOString(), by: user?.id },
      note,
    });
    if (decision !== "Escalate to UGC") {
      resolveDispute(selected.id, { summary: note });
    }
    toast.success("Mediation recorded");
    setSelected(null);
    setNote("");
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Disputes" description={`First-level mediation · ${open.length} open of ${mine.length} total`} />
      <DataTable
        columns={[
          { key: "id", label: "ID" },
          { key: "issueType", label: "Issue" },
          { key: "student", label: "Student", render: (r) => users.find((u) => u.id === r.parties?.student)?.name },
          { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
          { key: "actions", label: "", render: (r) => <Button size="sm" onClick={() => setSelected(r)}>Mediate</Button> },
        ]}
        rows={mine.map((d) => ({ ...d, id: d.id }))}
      />
      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={`Mediate ${selected?.id}`}>
        {selected ? (
          <div className="space-y-4 text-sm">
            <p>{selected.description}</p>
            <p><strong>Requested remedy:</strong> {selected.requestedRemedy}</p>
            <Select label="Decision" value={decision} onChange={(e) => setDecision(e.target.value)} options={["Upheld", "Partially upheld", "Not upheld", "Escalate to UGC"]} />
            <Textarea label="Mediation note" value={note} onChange={(e) => setNote(e.target.value)} />
            {selected.auditHistory ? (
              <ApplicationTimeline events={selected.auditHistory.map((e) => ({ at: e.at, status: e.action, note: e.actor }))} />
            ) : null}
            <Button onClick={mediate}>Submit decision</Button>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
