"use client";

import { PageHeader, DataTable, Badge, Avatar } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { getUniversityId } from "../_lib/helpers";

export default function TeamPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const uniId = getUniversityId(user);
  const users = useAppStore((s) => s.users);
  const reviewAssignments = useAppStore((s) => s.reviewAssignments);

  const team = users.filter((u) => u.role === "university-admin" && u.universityId === uniId);
  const workload = team.map((m) => ({
    ...m,
    assigned: Object.values(reviewAssignments).filter((a) => a.assignedTo === m.id).length,
  }));

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Team" description="Industry Collaboration Office reviewers and assignees" />
      <DataTable
        columns={[
          { key: "member", label: "Member", render: (r) => <div className="flex items-center gap-2"><Avatar name={r.name} size="sm" /><span>{r.name}</span></div> },
          { key: "designation", label: "Role" },
          { key: "email", label: "Email" },
          { key: "assigned", label: "Queue items", render: (r) => <Badge tone="teal">{r.assigned}</Badge> },
        ]}
        rows={workload.map((m) => ({ ...m, id: m.id }))}
        emptyMessage="No team members in seed data — you are the primary admin."
      />
    </div>
  );
}
