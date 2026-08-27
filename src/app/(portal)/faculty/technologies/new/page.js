"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { MultiStepForm, FileUploader } from "@/components/ui";
import { Button, Input, Textarea, Select } from "@/components/ui";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { technologyService } from "@/lib/mockServices";
import { toast } from "sonner";

const STEPS = [
  "Technology overview",
  "Problem and solution",
  "Readiness level",
  "IP/patent status",
  "Team and ownership",
  "Collaboration preference",
  "Supporting assets",
  "University review",
];

const INITIAL = {
  title: "",
  type: "Software prototype",
  sector: "",
  description: "",
  problem: "",
  solution: "",
  readinessLevel: "TRL 4 — Validated in lab",
  ipStatus: "Patent pending",
  team: "",
  ownership: "University shared",
  collaborationTypes: "Technology licensing, Joint research",
  licensingTerms: "",
  assets: null,
};

export default function NewTechnologyPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(INITIAL);
  const [submitting, setSubmitting] = useState(false);

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Title and description required");
      return;
    }
    setSubmitting(true);
    try {
      const tech = await technologyService.create({
        title: form.title,
        slug: form.title.toLowerCase().replace(/\s+/g, "-").slice(0, 40),
        type: form.type,
        sector: form.sector,
        description: form.description,
        problemStatement: form.problem,
        solution: form.solution,
        readinessLevel: form.readinessLevel,
        ipStatus: form.ipStatus,
        team: form.team,
        ownership: form.ownership,
        collaborationTypes: form.collaborationTypes.split(",").map((s) => s.trim()).filter(Boolean),
        licensingTerms: form.licensingTerms,
        supportingAssets: form.assets ? [form.assets] : [],
        capabilities: form.solution.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 5),
        contactEmail: user?.email,
        tags: [form.sector, form.type].filter(Boolean),
        status: "University review",
        facultyId: user?.id,
      });
      toast.success("Technology submitted for university review");
      router.push("/faculty/technology-transfer");
      return tech;
    } finally {
      setSubmitting(false);
    }
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Register technology" description="8-step wizard — submitted to university technology transfer office" />

      <MultiStepForm steps={STEPS} current={step} onStepChange={setStep}>
        {step === 0 && (
          <div className="card-surface max-w-xl space-y-4 p-4">
            <Input label="Technology title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Select
              label="Type"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              options={["Software prototype", "Hardware prototype", "Software patent", "Laboratory capability", "Process know-how"]}
            />
            <Input label="Sector" value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} placeholder="Healthcare, AgriTech..." />
            <Textarea label="Overview" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        )}
        {step === 1 && (
          <div className="card-surface max-w-xl space-y-4 p-4">
            <Textarea label="Problem statement" rows={3} value={form.problem} onChange={(e) => setForm({ ...form, problem: e.target.value })} />
            <Textarea label="Solution & capabilities" rows={4} value={form.solution} onChange={(e) => setForm({ ...form, solution: e.target.value })} />
          </div>
        )}
        {step === 2 && (
          <div className="card-surface max-w-xl space-y-4 p-4">
            <Select
              label="Technology readiness level"
              value={form.readinessLevel}
              onChange={(e) => setForm({ ...form, readinessLevel: e.target.value })}
              options={[
                "TRL 3 — Experimental proof of concept",
                "TRL 4 — Validated in lab",
                "TRL 5 — Validated in relevant environment",
                "TRL 6 — Demonstrated in relevant environment",
                "Operational facility",
              ]}
            />
          </div>
        )}
        {step === 3 && (
          <div className="card-surface max-w-xl space-y-4 p-4">
            <Select
              label="IP / patent status"
              value={form.ipStatus}
              onChange={(e) => setForm({ ...form, ipStatus: e.target.value })}
              options={["Patent pending", "Patent filed", "Patent granted", "Trade secret", "Copyright", "Open source (MIT)"]}
            />
          </div>
        )}
        {step === 4 && (
          <div className="card-surface max-w-xl space-y-4 p-4">
            <Textarea label="Team members" rows={2} value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })} />
            <Select
              label="University ownership"
              value={form.ownership}
              onChange={(e) => setForm({ ...form, ownership: e.target.value })}
              options={["University shared", "Faculty inventor lead", "Joint with industry partner"]}
            />
          </div>
        )}
        {step === 5 && (
          <div className="card-surface max-w-xl space-y-4 p-4">
            <Input
              label="Collaboration / licensing preferences (comma-separated)"
              value={form.collaborationTypes}
              onChange={(e) => setForm({ ...form, collaborationTypes: e.target.value })}
            />
            <Textarea label="Licensing terms" rows={3} value={form.licensingTerms} onChange={(e) => setForm({ ...form, licensingTerms: e.target.value })} />
          </div>
        )}
        {step === 6 && (
          <div className="card-surface max-w-xl space-y-4 p-4">
            <FileUploader
              label="Supporting document (spec sheet, pitch deck)"
              accept=".pdf,.ppt,.doc"
              value={form.assets}
              onChange={(file) => setForm({ ...form, assets: file })}
              onRemove={() => setForm({ ...form, assets: null })}
            />
          </div>
        )}
        {step === 7 && (
          <div className="card-surface max-w-xl space-y-4 p-4">
            <h3 className="font-semibold">Review & submit</h3>
            <ul className="space-y-1 text-sm text-secondary">
              <li><strong>Title:</strong> {form.title}</li>
              <li><strong>Type:</strong> {form.type} · {form.sector}</li>
              <li><strong>TRL:</strong> {form.readinessLevel}</li>
              <li><strong>IP:</strong> {form.ipStatus}</li>
              <li><strong>Collaboration:</strong> {form.collaborationTypes}</li>
            </ul>
            <p className="text-sm text-secondary">Submission routes to your university TTO for review before marketplace listing.</p>
            <Button loading={submitting} onClick={submit}>Submit for university review</Button>
          </div>
        )}

        <div className="flex gap-2">
          {step > 0 ? <Button variant="secondary" onClick={back}>Back</Button> : null}
          {step < STEPS.length - 1 ? <Button onClick={next}>Continue</Button> : null}
        </div>
      </MultiStepForm>
    </div>
  );
}
