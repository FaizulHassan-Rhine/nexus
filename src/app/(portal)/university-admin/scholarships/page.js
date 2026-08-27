"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader, FilterBar, Input, DataTable, StatusBadge, Button } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { formatDate } from "@/lib/formatters";
import { getUniversityId } from "../_lib/helpers";

export default function ScholarshipsPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const uniId = getUniversityId(user);
  const scholarships = useAppStore((s) => s.scholarships);
  const applications = useAppStore((s) => s.applications);
  const opportunities = useAppStore((s) => s.opportunities);
  const users = useAppStore((s) => s.users);

  const [search, setSearch] = useState("");
  const scholarshipOpps = opportunities.filter((o) => o.type === "Scholarship" || o.type === "Fellowship");
  const apps = applications.filter((a) => {
    const applicant = users.find((u) => u.id === a.applicantId);
    const opp = scholarshipOpps.find((o) => o.id === a.opportunityId);
    return applicant?.universityId === uniId && opp;
  });

  const filtered = apps.filter((a) => {
    const opp = opportunities.find((o) => o.id === a.opportunityId);
    return !search || opp?.title.toLowerCase().includes(search.toLowerCase());
  });

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Scholarships" description={`${scholarships.length} national programmes · ${apps.length} applications from your students`} />
      <FilterBar>
        <Input label="Search applications" value={search} onChange={(e) => setSearch(e.target.value)} />
      </FilterBar>
      <DataTable
        columns={[
          { key: "student", label: "Student", render: (r) => users.find((u) => u.id === r.applicantId)?.name },
          { key: "scholarship", label: "Scholarship", render: (r) => opportunities.find((o) => o.id === r.opportunityId)?.title },
          { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
          { key: "submittedAt", label: "Submitted", render: (r) => formatDate(r.submittedAt) },
          {
            key: "actions",
            label: "",
            render: (r) => (
              <Link href={`/university-admin/review-queue/${encodeURIComponent(`scholarship:${r.id}`)}`}>
                <Button size="sm" variant="secondary">Review docs</Button>
              </Link>
            ),
          },
        ]}
        rows={filtered.map((a) => ({ ...a, id: a.id }))}
      />
    </div>
  );
}
