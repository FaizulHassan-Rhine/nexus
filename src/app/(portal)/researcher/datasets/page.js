"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui";
import { Button, Input, Textarea, Badge } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { formatDate } from "@/lib/formatters";
import { toast } from "sonner";
import { getResearcherDatasets } from "../_lib/helpers";

const ACCESS_TONES = {
  Open: "green",
  Restricted: "amber",
  Confidential: "red",
  Embargoed: "violet",
};

export default function ResearcherDatasetsPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const projects = useAppStore((s) => s.projects);
  const updateProfile = useAppStore((s) => s.updateProfile);

  const [form, setForm] = useState({ title: "", access: "Restricted", description: "" });

  const datasets = useMemo(
    () => (user ? getResearcherDatasets(user, projects) : []),
    [user, projects]
  );

  const addDataset = () => {
    if (!user || !form.title.trim()) {
      toast.error("Dataset title required");
      return;
    }
    const entry = {
      id: `ds-${Date.now()}`,
      title: form.title.trim(),
      access: form.access,
      description: form.description.trim(),
      createdAt: new Date().toISOString(),
    };
    updateProfile(user.id, {
      datasets: [entry, ...(user.datasets || [])],
      datasetPublishing: true,
    });
    setForm({ title: "", access: "Restricted", description: "" });
    toast.success("Dataset registered (demo — saved to profile)");
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Datasets"
        description="Research datasets with access levels, sharing policies, and publication status"
        actions={
          user?.datasetPublishing ? (
            <Badge tone="green">Publishing enabled</Badge>
          ) : (
            <Badge tone="slate">Publishing disabled</Badge>
          )
        }
      />

      <div className="card-surface max-w-2xl space-y-4 p-4">
        <h3 className="font-semibold">Register dataset</h3>
        <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <Input
          label="Access level"
          value={form.access}
          onChange={(e) => setForm({ ...form, access: e.target.value })}
          placeholder="Open, Restricted, Confidential, Embargoed"
        />
        <Textarea label="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <Button onClick={addDataset}>Register dataset</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {datasets.map((ds) => (
          <article key={ds.id} className="card-surface p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold">{ds.title}</h3>
              <Badge tone={ACCESS_TONES[ds.access] || "slate"}>{ds.access || "Unknown"}</Badge>
            </div>
            {ds.description ? <p className="mt-2 text-sm text-secondary">{ds.description}</p> : null}
            <div className="mt-3 space-y-1 text-xs text-secondary">
              {ds.department ? <p>Department: {ds.department}</p> : null}
              {ds.projectTitle ? <p>Project: {ds.projectTitle}</p> : null}
              {ds.publishedAt ? <p>Published: {formatDate(ds.publishedAt)}</p> : null}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {ds.access === "Open" ? (
                <Button size="sm" variant="secondary" onClick={() => toast.message("Download link would open in production")}>
                  Download
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={() => toast.message("Access request sent to data steward")}>
                  Request access
                </Button>
              )}
            </div>
          </article>
        ))}
      </div>

      {!datasets.length && (
        <p className="text-center text-secondary">No datasets registered. Add your first dataset above.</p>
      )}
    </div>
  );
}
