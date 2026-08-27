"use client";

import { useMemo, useState } from "react";
import { PageHeader, SectionHeader } from "@/components/ui";
import { Button, Input, Textarea, Modal, Badge, Select } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { formatDate } from "@/lib/formatters";
import { toast } from "sonner";
import { getOrg, getPartnerUniversities } from "../_lib/helpers";

export default function PartnershipsPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const organizations = useAppStore((s) => s.organizations);
  const universities = useAppStore((s) => s.universities);

  const org = useMemo(() => getOrg(organizations, user?.organizationId), [organizations, user]);
  const partners = useMemo(() => getPartnerUniversities(universities, org), [universities, org]);

  const [requestOpen, setRequestOpen] = useState(false);
  const [form, setForm] = useState({ universityId: "", programme: "", focalPoint: "", message: "" });

  const availableUnis = universities.filter((u) => !org?.partnerUniversities?.includes(u.id));

  const submitRequest = () => {
    if (!form.universityId) {
      toast.error("Select a university");
      return;
    }
    toast.success("Partnership request sent to university administrator");
    setRequestOpen(false);
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-8">
      <PageHeader
        title="University partnerships"
        description="MoU-style records, focal points, and collaboration history"
        actions={<Button onClick={() => setRequestOpen(true)}>Request partnership</Button>}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {partners.map((u) => (
          <article key={u.id} className="card-surface p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{u.name}</h3>
                <p className="text-sm text-secondary">{u.location?.division || u.division} · {u.type}</p>
              </div>
              <Badge tone="green">Active</Badge>
            </div>
            <dl className="mt-4 space-y-1 text-sm">
              <div><dt className="inline text-secondary">Focal point: </dt><dd className="inline">{u.industryLiaison || "Industry Collaboration Office"}</dd></div>
              <div><dt className="inline text-secondary">Programmes: </dt><dd className="inline">Internships, co-funding, research</dd></div>
              <div><dt className="inline text-secondary">Since: </dt><dd className="inline">{formatDate(u.createdAt || "2024-01-01")}</dd></div>
            </dl>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => toast.message(`Message sent to ${u.name} liaison`)}>
                Contact focal point
              </Button>
            </div>
          </article>
        ))}
      </div>

      <section className="card-surface p-4">
        <SectionHeader title="Collaboration history" description="Recent joint activity (simulated)" />
        <ul className="mt-4 space-y-2 text-sm">
          <li className="flex justify-between border-b border-slate-100 py-2 dark:border-slate-800">
            <span>UGC co-funded internship batch — BUET</span>
            <span className="text-secondary">2026</span>
          </li>
          <li className="flex justify-between border-b border-slate-100 py-2 dark:border-slate-800">
            <span>Joint research — Smart Grid project</span>
            <span className="text-secondary">2025–2026</span>
          </li>
          <li className="flex justify-between py-2">
            <span>Campus recruitment drive — BRAC University</span>
            <span className="text-secondary">2025</span>
          </li>
        </ul>
      </section>

      <Modal open={requestOpen} onClose={() => setRequestOpen(false)} title="Partnership request">
        <div className="space-y-4">
          <Select
            label="University"
            value={form.universityId}
            onChange={(e) => setForm((f) => ({ ...f, universityId: e.target.value }))}
            placeholder="Select university..."
            options={availableUnis.slice(0, 12).map((u) => ({ value: u.id, label: u.name }))}
          />
          <Input label="Programme focus" value={form.programme} onChange={(e) => setForm((f) => ({ ...f, programme: e.target.value }))} placeholder="e.g. Internship MoU" />
          <Input label="Your focal point" value={form.focalPoint} onChange={(e) => setForm((f) => ({ ...f, focalPoint: e.target.value }))} />
          <Textarea label="Message" rows={3} value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
          <Button onClick={submitRequest}>Submit request</Button>
        </div>
      </Modal>
    </div>
  );
}
