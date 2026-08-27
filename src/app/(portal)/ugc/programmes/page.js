"use client";

import { useState } from "react";
import { PageHeader, DataTable, Button, Badge, Modal, Input, Select, StatusBadge } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useHydrated } from "@/hooks/useApp";
import { formatCurrency } from "@/lib/formatters";
import { toast } from "sonner";

export default function ProgrammesPage() {
  const hydrated = useHydrated();
  const programmes = useAppStore((s) => s.programmes);
  const updateProgramme = useAppStore((s) => s.updateProgramme);
  const createProgramme = useAppStore((s) => s.createProgramme);
  const [edit, setEdit] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: "", budget: "", status: "Draft" });

  const save = () => {
    if (edit) {
      updateProgramme(edit.id, { ...form, budget: Number(form.budget) || edit.budget });
      toast.success("Programme updated");
    }
    setEdit(null);
  };

  const create = () => {
    createProgramme({ name: form.name, budget: Number(form.budget) || 1000000, status: form.status });
    toast.success("Programme created");
    setCreateOpen(false);
    setForm({ name: "", budget: "", status: "Draft" });
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="National programmes" description="Manage the 7 national co-funding and grant programmes" actions={<Button onClick={() => setCreateOpen(true)}>Create programme</Button>} />
      <DataTable
        columns={[
          { key: "name", label: "Programme" },
          { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
          { key: "budget", label: "Budget", render: (r) => formatCurrency(r.budget) },
          { key: "used", label: "Used", render: (r) => `${formatCurrency(r.used)} (${Math.round((r.used / r.budget) * 100)}%)` },
          {
            key: "actions",
            label: "",
            render: (r) => (
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => setEdit({ ...r })}>Edit</Button>
                {r.status === "Active" ? (
                  <Button size="sm" variant="secondary" onClick={() => { updateProgramme(r.id, { status: "Paused" }); toast.success("Paused"); }}>Pause</Button>
                ) : (
                  <Button size="sm" onClick={() => { updateProgramme(r.id, { status: "Active" }); toast.success("Activated"); }}>Activate</Button>
                )}
              </div>
            ),
          },
        ]}
        rows={programmes.map((p) => ({ ...p, id: p.id }))}
      />

      <Modal open={Boolean(edit)} onClose={() => setEdit(null)} title="Edit programme">
        {edit ? (
          <div className="space-y-4">
            <Input label="Name" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
            <Input label="Budget (BDT)" type="number" value={edit.budget} onChange={(e) => setEdit({ ...edit, budget: e.target.value })} />
            <Select label="Status" value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value })} options={["Draft", "Active", "Paused", "Archived"]} />
            <Button onClick={save}>Save</Button>
          </div>
        ) : null}
      </Modal>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create programme">
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Budget" type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
          <Button onClick={create}>Create</Button>
        </div>
      </Modal>
    </div>
  );
}
