"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui";
import { Button, Input, Textarea, Badge } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { toast } from "sonner";

export default function ResearcherPublicationsPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const updateProfile = useAppStore((s) => s.updateProfile);

  const [form, setForm] = useState({ title: "", journal: "", year: new Date().getFullYear().toString(), doi: "" });
  const publications = user?.publications || [];

  const addPublication = () => {
    if (!user || !form.title.trim() || !form.journal.trim()) {
      toast.error("Title and journal are required");
      return;
    }
    const entry = {
      title: form.title.trim(),
      journal: form.journal.trim(),
      year: Number(form.year) || new Date().getFullYear(),
      doi: form.doi.trim() || undefined,
    };
    updateProfile(user.id, {
      publications: [entry, ...publications],
      profileCompletion: Math.min(100, (user.profileCompletion || 91) + 1),
    });
    setForm({ title: "", journal: "", year: new Date().getFullYear().toString(), doi: "" });
    toast.success("Publication added (demo — saved to profile)");
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Publications" description="Research outputs, journal articles, and preprints" />

      <div className="card-surface max-w-2xl space-y-4 p-4">
        <h3 className="font-semibold">Add publication</h3>
        <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <Input label="Journal / venue" value={form.journal} onChange={(e) => setForm({ ...form, journal: e.target.value })} />
        <Input label="Year" type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
        <Input label="DOI (optional)" value={form.doi} onChange={(e) => setForm({ ...form, doi: e.target.value })} placeholder="10.1016/j.example" />
        <Button onClick={addPublication}>Add publication</Button>
      </div>

      <ul className="space-y-3">
        {publications.map((pub, i) => (
          <li key={i} className="card-surface p-4">
            <p className="font-medium">{pub.title}</p>
            <p className="text-sm text-secondary">{pub.journal} · {pub.year}</p>
            {pub.doi ? <p className="mt-1 text-xs text-nexus-700">DOI: {pub.doi}</p> : null}
          </li>
        ))}
        {!publications.length && <p className="text-secondary">No publications yet. Add your first above.</p>}
      </ul>

      {(user?.patents || []).length ? (
        <div>
          <h3 className="font-semibold">Patents</h3>
          <ul className="mt-3 space-y-3">
            {user.patents.map((pat, i) => (
              <li key={i} className="card-surface p-4">
                <Badge tone="violet">Patent</Badge>
                <p className="mt-1 font-medium">{pat.title}</p>
                <p className="text-sm text-secondary">{pat.status} · {pat.year}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
