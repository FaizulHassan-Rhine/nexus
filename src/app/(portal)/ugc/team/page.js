"use client";

import { PageHeader, DataTable, Badge } from "@/components/ui";
import { useHydrated } from "@/hooks/useApp";
import { UGC_TEAM_ROLES } from "../_lib/helpers";

const TEAM = [
  { id: "1", name: "Farhana Akter", email: "ugc@nexus.demo", role: "Director, Digital Skills", status: "Active" },
  { id: "2", name: "Rashida Begum", email: "rashida.begum@ugc.gov.bd", role: "Programme Manager", status: "Active" },
  { id: "3", name: "Imran Hossain", email: "imran.hossain@ugc.gov.bd", role: "Compliance Officer", status: "Active" },
  { id: "4", name: "Nadia Rahman", email: "nadia.rahman@ugc.gov.bd", role: "Payments Analyst", status: "Active" },
  { id: "5", name: "Shafiq Ahmed", email: "shafiq.ahmed@ugc.gov.bd", role: "Policy Lead", status: "Active" },
  { id: "6", name: "Priya Das", email: "priya.das@ugc.gov.bd", role: "Data Analyst", status: "Active" },
];

export default function UgcTeamPage() {
  const hydrated = useHydrated();
  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Team" description={`National UGC Nexus team · roles: ${UGC_TEAM_ROLES.join(", ")}`} />
      <DataTable
        columns={[
          { key: "name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "role", label: "Role" },
          { key: "status", label: "Status", render: (r) => <Badge tone="green">{r.status}</Badge> },
        ]}
        rows={TEAM}
      />
    </div>
  );
}
