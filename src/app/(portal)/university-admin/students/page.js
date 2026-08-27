"use client";

import { useMemo, useState } from "react";
import { PageHeader, FilterBar, DataTable, Select, Input, Button, Badge, StatusBadge, Modal } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { toast } from "sonner";
import { getUniversityId, universityStudents } from "../_lib/helpers";

export default function StudentsPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const uniId = getUniversityId(user);
  const users = useAppStore((s) => s.users);
  const verifyUserProfile = useAppStore((s) => s.verifyUserProfile);
  const updateProfile = useAppStore((s) => s.updateProfile);

  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("all");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState(null);

  const students = useMemo(() => universityStudents(users, uniId), [users, uniId]);

  const filtered = students
    .filter((s) => dept === "all" || s.department === dept)
    .filter((s) => status === "all" || s.verificationStatus === status)
    .filter((s) => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.studentId?.includes(search));

  const departments = [...new Set(students.map((s) => s.department).filter(Boolean))];

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Students" description={`${students.length} registered students · ${uniId}`} />

      <FilterBar>
        <Input label="Search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name or student ID" />
        <Select label="Department" value={dept} onChange={(e) => setDept(e.target.value)} options={[{ value: "all", label: "All" }, ...departments.map((d) => ({ value: d, label: d }))]} />
        <Select label="Verification" value={status} onChange={(e) => setStatus(e.target.value)} options={[{ value: "all", label: "All" }, { value: "Verified", label: "Verified" }, { value: "Pending", label: "Pending" }]} />
      </FilterBar>

      <DataTable
        columns={[
          { key: "name", label: "Name" },
          { key: "studentId", label: "Student ID" },
          { key: "department", label: "Department" },
          { key: "programme", label: "Programme", render: (r) => <span className="max-w-xs truncate">{r.programme}</span> },
          { key: "verificationStatus", label: "Status", render: (r) => <StatusBadge status={r.verificationStatus} /> },
          { key: "profileCompletion", label: "Profile", render: (r) => `${r.profileCompletion || 0}%` },
          {
            key: "actions",
            label: "Actions",
            render: (r) => (
              <Button size="sm" variant="ghost" onClick={() => setSelected(r)}>Manage</Button>
            ),
          },
        ]}
        rows={filtered.map((s) => ({ ...s, id: s.id }))}
      />

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.name}>
        {selected ? (
          <div className="space-y-4 text-sm">
            <p><strong>Email:</strong> {selected.email}</p>
            <p><strong>Year:</strong> {selected.currentYear}</p>
            <p><strong>Skills:</strong> {(selected.skills || []).join(", ") || "—"}</p>
            <div className="flex gap-2">
              <Button onClick={() => { verifyUserProfile(selected.id, "Verified", "Verified by admin"); toast.success("Verified"); setSelected(null); }}>Verify</Button>
              <Button variant="secondary" onClick={() => { updateProfile(selected.id, { profileCompletion: Math.min(100, (selected.profileCompletion || 0) + 5) }); toast.success("Profile nudged"); }}>Nudge profile</Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
