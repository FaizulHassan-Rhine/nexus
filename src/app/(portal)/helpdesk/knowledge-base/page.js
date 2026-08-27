"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader, DataTable, Button, Badge, Modal, Input, Textarea, Select } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useHydrated } from "@/hooks/useApp";
import { toast } from "sonner";

export default function KnowledgeBasePage() {
  const hydrated = useHydrated();
  const helpArticles = useAppStore((s) => s.helpArticles);
  const updateHelpArticle = useAppStore((s) => s.updateHelpArticle);
  const createHelpArticle = useAppStore((s) => s.createHelpArticle);
  const [edit, setEdit] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Knowledge base" description={`${helpArticles.length} help articles for agents and users`} actions={<Button onClick={() => setCreateOpen(true)}>New article</Button>} />
      <DataTable
        columns={[
          { key: "title", label: "Title", render: (r) => <Link href={`/help/articles/${r.slug}`} className="font-medium text-nexus-700">{r.title}</Link> },
          { key: "category", label: "Category" },
          { key: "popular", label: "Popular", render: (r) => (r.popular ? <Badge tone="teal">Yes</Badge> : "—") },
          { key: "roles", label: "Roles", render: (r) => (r.roles || []).slice(0, 2).join(", ") },
          { key: "actions", label: "", render: (r) => <Button size="sm" variant="ghost" onClick={() => setEdit(r)}>Edit</Button> },
        ]}
        rows={helpArticles.map((a) => ({ ...a, id: a.id }))}
      />

      <Modal open={Boolean(edit)} onClose={() => setEdit(null)} title="Edit article">
        {edit ? (
          <div className="space-y-4">
            <Input label="Title" value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} />
            <Textarea label="Summary" value={edit.summary} onChange={(e) => setEdit({ ...edit, summary: e.target.value })} />
            <Textarea label="Content" rows={6} value={edit.content} onChange={(e) => setEdit({ ...edit, content: e.target.value })} />
            <Button onClick={() => { updateHelpArticle(edit.id, edit); toast.success("Saved"); setEdit(null); }}>Save</Button>
          </div>
        ) : null}
      </Modal>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New article">
        <ArticleForm onSubmit={(payload) => { createHelpArticle(payload); toast.success("Created"); setCreateOpen(false); }} />
      </Modal>
    </div>
  );
}

function ArticleForm({ onSubmit }) {
  const [form, setForm] = useState({ title: "", category: "Support", summary: "", content: "", roles: ["helpdesk"] });
  return (
    <div className="space-y-4">
      <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} options={["Onboarding", "Matching", "Funding", "Support", "Technical"]} />
      <Textarea label="Summary" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
      <Textarea label="Content" rows={4} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
      <Button onClick={() => onSubmit(form)}>Create</Button>
    </div>
  );
}
