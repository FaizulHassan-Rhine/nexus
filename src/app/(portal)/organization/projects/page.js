"use client";

import { useMemo, useState } from "react";
import { PageHeader, DataTable } from "@/components/ui";
import { Button, Input, Textarea, Modal, Badge, StatusBadge } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { toast } from "sonner";
import { getOrgProjects } from "../_lib/helpers";

export default function OrganizationProjectsPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const projects = useAppStore((s) => s.projects);
  const createProject = useAppStore((s) => s.createProject);

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    type: "Industry challenge",
    description: "",
    fundingAmount: 200000,
    ipTerms: "Joint IP with university oversight",
    milestones: "Proposal → Prototype → Demo day",
  });

  const orgProjects = useMemo(() => getOrgProjects(projects, user?.organizationId), [projects, user]);

  const submit = () => {
    if (!form.title.trim()) {
      toast.error("Title required");
      return;
    }
    createProject({
      ...form,
      organizationId: user?.organizationId,
      type: form.type,
      milestones: form.milestones.split("→").map((m, i) => ({ label: m.trim(), status: i === 0 ? "In progress" : "Pending" })),
    });
    toast.success("Industry challenge created");
    setCreateOpen(false);
  };

  if (!hydrated) return null;

  const columns = [
    { key: "title", label: "Project", render: (row) => row.title },
    { key: "type", label: "Type", render: (row) => <Badge tone="teal">{row.type}</Badge> },
    { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { key: "funding", label: "Budget", render: (row) => formatCurrency(row.fundingAmount, row.currency || "BDT") },
    { key: "dates", label: "Timeline", render: (row) => `${formatDate(row.startDate)} – ${formatDate(row.endDate)}` },
    { key: "team", label: "Team", render: (row) => (row.teamMembers?.length || row.team?.length || 0) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Industry projects"
        description="Sponsored challenges, research problems, and student teams"
        actions={<Button onClick={() => setCreateOpen(true)}>New challenge</Button>}
      />

      <DataTable columns={columns} rows={orgProjects} emptyMessage="No projects yet." />

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Industry challenge">
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <Input label="Type" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} />
          <Textarea label="Challenge description" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          <Input label="Budget (BDT)" type="number" value={form.fundingAmount} onChange={(e) => setForm((f) => ({ ...f, fundingAmount: e.target.value }))} />
          <Textarea label="IP terms" rows={2} value={form.ipTerms} onChange={(e) => setForm((f) => ({ ...f, ipTerms: e.target.value }))} />
          <Input label="Milestones" value={form.milestones} onChange={(e) => setForm((f) => ({ ...f, milestones: e.target.value }))} />
          <Button onClick={submit}>Create project</Button>
        </div>
      </Modal>
    </div>
  );
}
