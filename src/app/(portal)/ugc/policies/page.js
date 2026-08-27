"use client";

import { useState } from "react";
import { PageHeader, DataTable, Button, StatusBadge, Modal, Input, Textarea, Select } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useHydrated } from "@/hooks/useApp";
import { formatDate } from "@/lib/formatters";
import { toast } from "sonner";

const STATUSES = ["Draft", "Review", "Scheduled", "Published", "Archived"];

export default function PoliciesPage() {
  const hydrated = useHydrated();
  const policies = useAppStore((s) => s.policies);
  const updatePolicy = useAppStore((s) => s.updatePolicy);
  const createPolicy = useAppStore((s) => s.createPolicy);
  const [filter, setFilter] = useState("all");
  const [edit, setEdit] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = policies.filter((p) => filter === "all" || p.status === filter);

  const publish = (p) => {
    updatePolicy(p.id, { status: "Published", publishedAt: new Date().toISOString() });
    toast.success("Published");
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Policies" description="Draft, review, schedule, publish, and archive national policies" actions={<Button onClick={() => setCreateOpen(true)}>Draft policy</Button>} />
      <Select label="Filter status" value={filter} onChange={(e) => setFilter(e.target.value)} options={[{ value: "all", label: "All" }, ...STATUSES.map((s) => ({ value: s, label: s }))]} />
      <DataTable
        columns={[
          { key: "title", label: "Policy" },
          { key: "version", label: "Version" },
          { key: "category", label: "Category" },
          { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
          { key: "effective", label: "Effective", render: (r) => formatDate(r.effectiveFrom || r.scheduledFor || r.publishedAt) },
          {
            key: "actions",
            label: "",
            render: (r) => (
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => setEdit(r)}>Edit</Button>
                {r.status === "Draft" && <Button size="sm" variant="secondary" onClick={() => { updatePolicy(r.id, { status: "Review" }); toast.success("Sent to review"); }}>Review</Button>}
                {r.status === "Review" && <Button size="sm" onClick={() => publish(r)}>Publish</Button>}
                {r.status === "Published" && <Button size="sm" variant="outline" onClick={() => { updatePolicy(r.id, { status: "Archived", archivedAt: new Date().toISOString() }); toast.success("Archived"); }}>Archive</Button>}
              </div>
            ),
          },
        ]}
        rows={filtered.map((p) => ({ ...p, id: p.id }))}
      />
      <Modal open={Boolean(edit)} onClose={() => setEdit(null)} title="Edit policy">
        {edit ? (
          <div className="space-y-4">
            <Input label="Title" value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} />
            <Textarea label="Body" value={edit.body} onChange={(e) => setEdit({ ...edit, body: e.target.value })} />
            <Select label="Status" value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value })} options={STATUSES} />
            <Button onClick={() => { updatePolicy(edit.id, edit); toast.success("Saved"); setEdit(null); }}>Save</Button>
          </div>
        ) : null}
      </Modal>
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Draft policy">
        <PolicyCreateForm onCreate={(payload) => { createPolicy(payload); toast.success("Draft created"); setCreateOpen(false); }} />
      </Modal>
    </div>
  );
}

function PolicyCreateForm({ onCreate }) {
  const [form, setForm] = useState({ title: "", category: "Funding", summary: "", body: "" });
  return (
    <div className="space-y-4">
      <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <Input label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
      <Textarea label="Summary" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
      <Button onClick={() => onCreate(form)}>Create draft</Button>
    </div>
  );
}
