"use client";

import { PageHeader, DataTable, Badge, Button } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { toast } from "sonner";
import { getUniversityId } from "../_lib/helpers";

export default function PartnershipsPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const uniId = getUniversityId(user);
  const universities = useAppStore((s) => s.universities);
  const organizations = useAppStore((s) => s.organizations);
  const opportunities = useAppStore((s) => s.opportunities);

  const uni = universities.find((u) => u.id === uniId);
  const partners = organizations.filter((o) => o.verificationStatus === "Verified").slice(0, 20);
  const activeOpps = opportunities.filter((o) => o.status === "Published").length;

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Partnerships" description={`${uni?.activePartnerships || partners.length} active industry partnerships · ${activeOpps} live opportunities`} />
      <DataTable
        columns={[
          { key: "name", label: "Partner" },
          { key: "type", label: "Type" },
          { key: "division", label: "Division" },
          { key: "verificationStatus", label: "Status", render: (r) => <Badge tone="green">{r.verificationStatus}</Badge> },
          { key: "activeOpportunities", label: "Opportunities", render: (r) => r.activeOpportunities ?? opportunities.filter((o) => o.organizationId === r.id).length },
          {
            key: "actions",
            label: "",
            render: () => <Button size="sm" variant="ghost" onClick={() => toast.message("Partnership MOU simulated — no document generated")}>View MOU</Button>,
          },
        ]}
        rows={partners.map((p) => ({ ...p, id: p.id }))}
      />
    </div>
  );
}
