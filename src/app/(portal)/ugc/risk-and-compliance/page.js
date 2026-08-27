"use client";

import { useMemo } from "react";
import { PageHeader, Button, Badge, Modal, Textarea } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useHydrated } from "@/hooks/useApp";
import { toast } from "sonner";
import { computeRiskAlerts } from "../_lib/helpers";
import { useState } from "react";

export default function RiskCompliancePage() {
  const hydrated = useHydrated();
  const state = useAppStore();
  const setRiskAction = useAppStore((s) => s.setRiskAction);
  const [explain, setExplain] = useState(null);
  const [note, setNote] = useState("");

  const alerts = useMemo(() => computeRiskAlerts(state), [state]);

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Risk & compliance" description="Deterministic mock rules — explain, dismiss, or escalate alerts" />
      <ul className="space-y-3">
        {alerts.map((a) => (
          <li key={a.id} className="card-surface p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="flex gap-2">
                  <Badge tone={a.severity === "Critical" ? "red" : a.severity === "High" ? "amber" : "slate"}>{a.severity}</Badge>
                  <Badge tone="violet">{a.category}</Badge>
                </div>
                <p className="mt-2 font-semibold">{a.title}</p>
                <p className="mt-1 text-sm text-secondary">{a.explanation}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => setExplain(a)}>Explain</Button>
                <Button size="sm" variant="secondary" onClick={() => { setRiskAction(a.id, "dismiss", note); toast.success("Dismissed"); }}>Dismiss</Button>
                <Button size="sm" variant="danger" onClick={() => { setRiskAction(a.id, "escalate", note); toast.success("Escalated"); }}>Escalate</Button>
              </div>
            </div>
          </li>
        ))}
        {!alerts.length && <p className="text-secondary">No active risk alerts.</p>}
      </ul>
      <Modal open={Boolean(explain)} onClose={() => setExplain(null)} title="Rule explanation">
        {explain ? (
          <div className="space-y-3 text-sm">
            <p><strong>Rule ID:</strong> {explain.id.split("-").slice(0, 3).join("-")}</p>
            <p>{explain.explanation}</p>
            <p><strong>Entity:</strong> {explain.entityType} · {explain.entityId}</p>
            <Textarea label="Officer note" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
