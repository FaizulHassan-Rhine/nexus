"use client";

import { useMemo, useState } from "react";
import { PageHeader, DataTable, StatCard } from "@/components/ui";
import { Button, Input, Textarea, Modal, Badge, StatusBadge } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { formatDate } from "@/lib/formatters";
import { toast } from "sonner";
import { getOrgCourses } from "../_lib/helpers";

export default function OrganizationCoursesPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const courses = useAppStore((s) => s.courses);
  const users = useAppStore((s) => s.users);

  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ title: "", duration: "", seats: 30, fee: 0, status: "Active" });

  const orgCourses = useMemo(() => getOrgCourses(courses, user?.organizationId), [courses, user]);

  const enrollments = useMemo(() => {
    let total = 0;
    let completed = 0;
    users.forEach((u) => {
      (u.courseEnrollments || []).forEach((e) => {
        if (orgCourses.some((c) => c.id === e.courseId)) {
          total += 1;
          if (e.status === "Completed") completed += 1;
        }
      });
    });
    return { total, completed, rate: total ? Math.round((completed / total) * 100) : 0 };
  }, [users, orgCourses]);

  const saveCourse = () => {
    toast.success("Training programme updated (simulated)");
    setEditOpen(false);
  };

  if (!hydrated) return null;

  const columns = [
    { key: "title", label: "Programme", render: (row) => row.title },
    { key: "duration", label: "Duration", render: (row) => row.duration || "—" },
    { key: "seats", label: "Seats", render: (row) => row.seats ?? row.capacity ?? "—" },
    { key: "fee", label: "Fee", render: (row) => row.fee != null ? `${row.fee} BDT` : "Free" },
    { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status || "Active"} /> },
    { key: "skills", label: "Skills", render: (row) => (
      <div className="flex flex-wrap gap-1">
        {(row.skillsTaught || row.skills || []).slice(0, 3).map((s) => <Badge key={s} tone="slate">{s}</Badge>)}
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Training programmes"
        description="Manage courses, enrollments, and completion outcomes"
        actions={<Button onClick={() => setEditOpen(true)}>Add programme</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Active programmes" value={orgCourses.length} tone="teal" />
        <StatCard label="Total enrollments" value={enrollments.total} tone="blue" />
        <StatCard label="Completion rate" value={`${enrollments.rate}%`} hint={`${enrollments.completed} completed`} tone="green" />
      </div>

      <DataTable columns={columns} rows={orgCourses} emptyMessage="No training programmes linked to your organization." />

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Training programme">
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <Input label="Duration" value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))} />
          <Input label="Seats" type="number" value={form.seats} onChange={(e) => setForm((f) => ({ ...f, seats: e.target.value }))} />
          <Input label="Fee (BDT)" type="number" value={form.fee} onChange={(e) => setForm((f) => ({ ...f, fee: e.target.value }))} />
          <Textarea label="Learning outcomes" rows={2} />
          <Button onClick={saveCourse}>Save</Button>
        </div>
      </Modal>
    </div>
  );
}
