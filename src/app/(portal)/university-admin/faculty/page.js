"use client";

import { useMemo, useState } from "react";
import { PageHeader, FilterBar, DataTable, Input, Button, StatusBadge, Modal } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { toast } from "sonner";
import { getUniversityId, universityFaculty } from "../_lib/helpers";

export default function FacultyPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const uniId = getUniversityId(user);
  const users = useAppStore((s) => s.users);
  const verifyUserProfile = useAppStore((s) => s.verifyUserProfile);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const faculty = useMemo(() => universityFaculty(users, uniId), [users, uniId]);
  const filtered = faculty.filter((f) => !search || f.name.toLowerCase().includes(search.toLowerCase()) || f.employeeId?.includes(search));

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Faculty" description={`${faculty.length} faculty profiles on Nexus`} />
      <FilterBar>
        <Input label="Search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name or employee ID" />
      </FilterBar>
      <DataTable
        columns={[
          { key: "name", label: "Name" },
          { key: "designation", label: "Designation" },
          { key: "department", label: "Department" },
          { key: "verificationStatus", label: "Status", render: (r) => <StatusBadge status={r.verificationStatus} /> },
          { key: "profileCompletion", label: "Profile", render: (r) => `${r.profileCompletion || 0}%` },
          { key: "actions", label: "", render: (r) => <Button size="sm" variant="ghost" onClick={() => setSelected(r)}>View</Button> },
        ]}
        rows={filtered.map((f) => ({ ...f, id: f.id }))}
      />
      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.name}>
        {selected ? (
          <div className="space-y-3 text-sm">
            <p>{selected.designation} · {selected.department}</p>
            <p>Research: {(selected.researchAreas || selected.researchInterests || []).join?.(", ") || "—"}</p>
            <Button onClick={() => { verifyUserProfile(selected.id, "Verified"); toast.success("Faculty verified"); setSelected(null); }}>Verify profile</Button>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
