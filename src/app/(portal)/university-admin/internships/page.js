"use client";

import { useMemo, useState } from "react";
import { PageHeader, DataTable, Button, StatusBadge, Badge, Textarea, Modal } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { formatDate } from "@/lib/formatters";
import { toast } from "sonner";
import { getUniversityId, activeInternships } from "../_lib/helpers";

export default function InternshipsPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const uniId = getUniversityId(user);
  const applications = useAppStore((s) => s.applications);
  const opportunities = useAppStore((s) => s.opportunities);
  const users = useAppStore((s) => s.users);
  const organizations = useAppStore((s) => s.organizations);
  const updateApplicationStatus = useAppStore((s) => s.updateApplicationStatus);
  const [intervention, setIntervention] = useState(null);

  const internships = useMemo(
    () => activeInternships(applications, opportunities, users, uniId),
    [applications, opportunities, users, uniId]
  );

  const orgMap = Object.fromEntries(organizations.map((o) => [o.id, o]));
  const oppMap = Object.fromEntries(opportunities.map((o) => [o.id, o]));

  const submitIntervention = () => {
    if (!intervention?.note?.trim()) {
      toast.error("Intervention note required");
      return;
    }
    updateApplicationStatus(intervention.id, "In progress", `Intervention: ${intervention.note}`, "university-admin");
    toast.success("Intervention logged");
    setIntervention(null);
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Internships" description={`Monitor ${internships.length} confirmed internships · check-ins and interventions`} />

      <DataTable
        columns={[
          {
            key: "student",
            label: "Student",
            render: (r) => users.find((u) => u.id === r.applicantId)?.name,
          },
          { key: "opp", label: "Opportunity", render: (r) => oppMap[r.opportunityId]?.title },
          { key: "org", label: "Organization", render: (r) => orgMap[oppMap[r.opportunityId]?.organizationId]?.name },
          { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
          { key: "updatedAt", label: "Last update", render: (r) => formatDate(r.updatedAt) },
          {
            key: "checkIn",
            label: "Check-in",
            render: (r) => <Badge tone="teal">{r.checkInStatus || "Due this week"}</Badge>,
          },
          {
            key: "actions",
            label: "",
            render: (r) => (
              <Button size="sm" variant="secondary" onClick={() => setIntervention({ id: r.id, note: "" })}>Intervene</Button>
            ),
          },
        ]}
        rows={internships.map((i) => ({ ...i, id: i.id }))}
        emptyMessage="No confirmed internships."
      />

      <Modal open={Boolean(intervention)} onClose={() => setIntervention(null)} title="Log intervention">
        <Textarea label="Intervention note" rows={4} value={intervention?.note || ""} onChange={(e) => setIntervention({ ...intervention, note: e.target.value })} />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setIntervention(null)}>Cancel</Button>
          <Button onClick={submitIntervention}>Submit</Button>
        </div>
      </Modal>
    </div>
  );
}
