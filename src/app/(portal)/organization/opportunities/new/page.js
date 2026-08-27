"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui";
import {
  Button,
  Input,
  Textarea,
  Select,
  Checkbox,
  Switch,
  MultiStepForm,
  FileUploader,
  Badge,
} from "@/components/ui";
import { FundingSplitCard } from "@/components/domain/Domain";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { opportunityService } from "@/lib/mockServices";
import { OPPORTUNITY_TYPES, DIVISIONS, DISCIPLINES } from "@/lib/constants";
import { percentPair } from "@/lib/validators";
import { formatCurrency } from "@/lib/formatters";
import { toast } from "sonner";
import { COURSE_TYPES, SCHOLARSHIP_TYPES, PROJECT_TYPES } from "../../_lib/helpers";

const BASE_STEPS = [
  "Type",
  "Basic info",
  "Eligibility",
  "Skills & match",
  "Location & schedule",
  "Compensation",
  "UGC co-funding",
  "Selection workflow",
  "University approval",
  "Documents & policies",
  "Preview & publish",
];

const defaultForm = () => ({
  type: "",
  title: "",
  description: "",
  responsibilities: "",
  requirements: "",
  tags: "",
  targetStudyYears: [],
  departments: [],
  targetRoles: ["student"],
  requiredSkills: "",
  preferredSkills: "",
  careerTracks: "",
  division: "Dhaka",
  location: "",
  workMode: "Hybrid",
  duration: "",
  weeklyHours: 20,
  startDate: "",
  deadline: "",
  slots: 1,
  compensationAmount: 15000,
  compensationCurrency: "BDT",
  compensationPeriod: "monthly",
  benefits: "",
  enableUgcCoFunding: false,
  companySharePercent: 50,
  ugcSharePercent: 50,
  ugcProgrammeId: "ugc-cofund-2025",
  selectionStages: "Application → University review → Interview → Offer",
  universityApprovalRequired: true,
  policyDocument: null,
  supportingDocument: null,
  publishNow: false,
  syllabus: "",
  fee: 0,
  subsidyPercent: 0,
  seats: 30,
  certificate: true,
  learningOutcomes: "",
  scholarshipCountry: "",
  degreeLevel: "Undergraduate",
  fundingCoverage: "",
  challengeDescription: "",
  budget: 0,
  deliverables: "",
  ipTerms: "University retains research IP; industry gets non-exclusive license.",
  mentorAvailable: true,
});

function isCourseType(type) {
  return COURSE_TYPES.includes(type);
}

function isScholarshipType(type) {
  return SCHOLARSHIP_TYPES.includes(type);
}

function isProjectType(type) {
  return PROJECT_TYPES.includes(type);
}

export default function NewOpportunityPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const router = useRouter();
  const org = useAppStore((s) => s.organizations.find((o) => o.id === user?.organizationId));

  const [step, setStep] = useState(0);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);

  const steps = useMemo(() => {
    if (!form.type) return ["Type"];
    return BASE_STEPS;
  }, [form.type]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const toggleArray = (key, val) => {
    setForm((f) => {
      const arr = f[key] || [];
      return { ...f, [key]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val] };
    });
  };

  const validateStep = () => {
    if (step === 0 && !form.type) {
      toast.error("Select an opportunity type");
      return false;
    }
    if (step === 1 && !form.title.trim()) {
      toast.error("Title is required");
      return false;
    }
    if (step === 6 && form.enableUgcCoFunding) {
      const err = percentPair(form.companySharePercent, form.ugcSharePercent);
      if (err) {
        toast.error(err);
        return false;
      }
    }
    return true;
  };

  const next = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const buildPayload = (status = "Draft") => ({
    type: form.type,
    title: form.title,
    description: form.description,
    responsibilities: form.responsibilities.split("\n").filter(Boolean),
    requirements: form.requirements.split("\n").filter(Boolean),
    tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    targetStudyYears: form.targetStudyYears,
    departments: form.departments,
    targetRoles: form.targetRoles,
    requiredSkills: form.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean),
    preferredSkills: form.preferredSkills.split(",").map((s) => s.trim()).filter(Boolean),
    careerTracks: form.careerTracks.split(",").map((s) => s.trim()).filter(Boolean),
    division: form.division,
    location: form.location,
    workMode: form.workMode,
    duration: form.duration,
    weeklyHours: Number(form.weeklyHours) || 20,
    startDate: form.startDate,
    deadline: form.deadline,
    slots: Number(form.slots) || 1,
    compensation: {
      amount: Number(form.compensationAmount) || 0,
      currency: form.compensationCurrency,
      period: form.compensationPeriod,
    },
    benefits: form.benefits.split("\n").filter(Boolean),
    fundingModel: form.enableUgcCoFunding ? `Company + UGC co-funding (${form.companySharePercent}/${form.ugcSharePercent})` : "Company funded",
    ugcProgrammeId: form.enableUgcCoFunding ? form.ugcProgrammeId : null,
    companySharePercent: form.enableUgcCoFunding ? form.companySharePercent : 100,
    ugcSharePercent: form.enableUgcCoFunding ? form.ugcSharePercent : 0,
    selectionWorkflow: form.selectionStages,
    universityApprovalRequired: form.universityApprovalRequired,
    status,
    ...(isCourseType(form.type) ? {
      syllabus: form.syllabus,
      fee: Number(form.fee),
      subsidyPercent: Number(form.subsidyPercent),
      seats: Number(form.seats),
      certificateOffered: form.certificate,
      learningOutcomes: form.learningOutcomes.split("\n").filter(Boolean),
    } : {}),
    ...(isScholarshipType(form.type) ? {
      scholarshipCountry: form.scholarshipCountry,
      degreeLevel: form.degreeLevel,
      fundingCoverage: form.fundingCoverage,
    } : {}),
    ...(isProjectType(form.type) ? {
      challengeDescription: form.challengeDescription,
      budget: Number(form.budget),
      deliverables: form.deliverables.split("\n").filter(Boolean),
      ipTerms: form.ipTerms,
      mentorAvailable: form.mentorAvailable,
    } : {}),
  });

  const submit = async (publish = false) => {
    if (!validateStep()) return;
    setSubmitting(true);
    try {
      const opp = await opportunityService.create(buildPayload(publish ? "Published" : "Draft"));
      if (publish) await opportunityService.publish(opp.id);
      toast.success(publish ? "Opportunity published" : "Draft saved");
      router.push(`/organization/opportunities/${opp.id}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Post new opportunity"
        description={`${org?.name || "Organization"} · Dynamic wizard adapts fields by type`}
      />

      <div className="card-surface p-4">
        <MultiStepForm steps={steps} current={step} onStepChange={setStep}>
          {step === 0 && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {OPPORTUNITY_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => { set("type", type); setStep(1); }}
                  className={`rounded-xl border p-4 text-left text-sm transition hover:border-nexus-400 ${form.type === type ? "border-nexus-600 bg-nexus-50 dark:bg-nexus-950" : "border-slate-200 dark:border-slate-700"}`}
                >
                  <p className="font-medium">{type}</p>
                  {isCourseType(type) && <p className="mt-1 text-xs text-secondary">Includes syllabus, fee, seats</p>}
                  {isScholarshipType(type) && <p className="mt-1 text-xs text-secondary">Includes eligibility & coverage</p>}
                  {isProjectType(type) && <p className="mt-1 text-xs text-secondary">Includes budget, deliverables, IP</p>}
                </button>
              ))}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <Badge tone="teal">{form.type}</Badge>
              <Input label="Title" value={form.title} onChange={(e) => set("title", e.target.value)} />
              <Textarea label="Description" rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} />
              <Textarea label="Responsibilities (one per line)" rows={3} value={form.responsibilities} onChange={(e) => set("responsibilities", e.target.value)} />
              {isCourseType(form.type) && (
                <>
                  <Textarea label="Syllabus outline" rows={3} value={form.syllabus} onChange={(e) => set("syllabus", e.target.value)} />
                  <Input label="Course fee (BDT)" type="number" value={form.fee} onChange={(e) => set("fee", e.target.value)} />
                  <Input label="Subsidy %" type="number" value={form.subsidyPercent} onChange={(e) => set("subsidyPercent", e.target.value)} />
                  <Input label="Seats" type="number" value={form.seats} onChange={(e) => set("seats", e.target.value)} />
                  <Switch label="Certificate offered" checked={form.certificate} onChange={(v) => set("certificate", v)} />
                  <Textarea label="Learning outcomes" rows={2} value={form.learningOutcomes} onChange={(e) => set("learningOutcomes", e.target.value)} />
                </>
              )}
              {isScholarshipType(form.type) && (
                <>
                  <Input label="Target country/region" value={form.scholarshipCountry} onChange={(e) => set("scholarshipCountry", e.target.value)} />
                  <Select label="Degree level" value={form.degreeLevel} onChange={(e) => set("degreeLevel", e.target.value)} options={[
                    { value: "Undergraduate", label: "Undergraduate" },
                    { value: "Postgraduate", label: "Postgraduate" },
                    { value: "Doctoral", label: "Doctoral" },
                  ]} />
                  <Textarea label="Funding coverage" rows={2} value={form.fundingCoverage} onChange={(e) => set("fundingCoverage", e.target.value)} />
                </>
              )}
              {isProjectType(form.type) && (
                <>
                  <Textarea label="Challenge / problem statement" rows={3} value={form.challengeDescription} onChange={(e) => set("challengeDescription", e.target.value)} />
                  <Input label="Budget (BDT)" type="number" value={form.budget} onChange={(e) => set("budget", e.target.value)} />
                  <Textarea label="Deliverables" rows={2} value={form.deliverables} onChange={(e) => set("deliverables", e.target.value)} />
                  <Textarea label="IP terms" rows={2} value={form.ipTerms} onChange={(e) => set("ipTerms", e.target.value)} />
                  <Switch label="Mentor available" checked={form.mentorAvailable} onChange={(v) => set("mentorAvailable", v)} />
                </>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Target study years</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map((y) => (
                    <Checkbox key={y} label={`Year ${y}`} checked={form.targetStudyYears.includes(y)} onChange={() => toggleArray("targetStudyYears", y)} />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Departments</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {DISCIPLINES.slice(0, 8).map((d) => (
                    <Checkbox key={d} label={d} checked={form.departments.includes(d)} onChange={() => toggleArray("departments", d)} />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Target roles</p>
                <div className="mt-2 flex gap-4">
                  {["student", "faculty"].map((r) => (
                    <Checkbox key={r} label={r} checked={form.targetRoles.includes(r)} onChange={() => toggleArray("targetRoles", r)} />
                  ))}
                </div>
              </div>
              <Textarea label="Requirements" rows={3} value={form.requirements} onChange={(e) => set("requirements", e.target.value)} />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <Input label="Required skills (comma-separated)" value={form.requiredSkills} onChange={(e) => set("requiredSkills", e.target.value)} />
              <Input label="Preferred skills" value={form.preferredSkills} onChange={(e) => set("preferredSkills", e.target.value)} />
              <Input label="Career tracks" value={form.careerTracks} onChange={(e) => set("careerTracks", e.target.value)} />
              <Input label="Tags" value={form.tags} onChange={(e) => set("tags", e.target.value)} />
            </div>
          )}

          {step === 4 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Select label="Division" value={form.division} onChange={(e) => set("division", e.target.value)} options={DIVISIONS.map((d) => ({ value: d, label: d }))} />
              <Input label="Location" value={form.location} onChange={(e) => set("location", e.target.value)} />
              <Select label="Work mode" value={form.workMode} onChange={(e) => set("workMode", e.target.value)} options={[
                { value: "Onsite", label: "Onsite" },
                { value: "Hybrid", label: "Hybrid" },
                { value: "Remote", label: "Remote" },
              ]} />
              <Input label="Duration" value={form.duration} onChange={(e) => set("duration", e.target.value)} placeholder="e.g. 4 months" />
              <Input label="Weekly hours" type="number" value={form.weeklyHours} onChange={(e) => set("weeklyHours", e.target.value)} />
              <Input label="Start date" type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
              <Input label="Application deadline" type="date" value={form.deadline} onChange={(e) => set("deadline", e.target.value)} />
              <Input label="Open slots" type="number" value={form.slots} onChange={(e) => set("slots", e.target.value)} />
            </div>
          )}

          {step === 5 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Compensation amount" type="number" value={form.compensationAmount} onChange={(e) => set("compensationAmount", e.target.value)} />
              <Select label="Currency" value={form.compensationCurrency} onChange={(e) => set("compensationCurrency", e.target.value)} options={[
                { value: "BDT", label: "BDT" },
                { value: "USD", label: "USD" },
              ]} />
              <Select label="Period" value={form.compensationPeriod} onChange={(e) => set("compensationPeriod", e.target.value)} options={[
                { value: "monthly", label: "Monthly" },
                { value: "lump sum", label: "Lump sum" },
                { value: "course fee", label: "Course fee" },
                { value: "free", label: "Free" },
              ]} />
              <Textarea className="sm:col-span-2" label="Benefits" rows={3} value={form.benefits} onChange={(e) => set("benefits", e.target.value)} />
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <Switch
                label="Apply for UGC co-funding"
                checked={form.enableUgcCoFunding}
                onChange={(v) => set("enableUgcCoFunding", v)}
                description={org?.ugcCoFundingEligible ? "Your organization is eligible" : "May require additional verification"}
              />
              {form.enableUgcCoFunding ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Company share %"
                      type="number"
                      value={form.companySharePercent}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        set("companySharePercent", v);
                        set("ugcSharePercent", 100 - v);
                      }}
                    />
                    <Input
                      label="UGC share %"
                      type="number"
                      value={form.ugcSharePercent}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        set("ugcSharePercent", v);
                        set("companySharePercent", 100 - v);
                      }}
                    />
                  </div>
                  <FundingSplitCard
                    companyShare={form.companySharePercent}
                    ugcShare={form.ugcSharePercent}
                    total={Number(form.compensationAmount) * 4}
                  />
                  {percentPair(form.companySharePercent, form.ugcSharePercent) ? (
                    <p className="text-sm text-danger">{percentPair(form.companySharePercent, form.ugcSharePercent)}</p>
                  ) : null}
                </>
              ) : (
                <p className="text-sm text-secondary">Fully company-funded role — no UGC split required.</p>
              )}
            </div>
          )}

          {step === 7 && (
            <Textarea label="Selection workflow stages" rows={4} value={form.selectionStages} onChange={(e) => set("selectionStages", e.target.value)} />
          )}

          {step === 8 && (
            <div className="space-y-4">
              <Switch
                label="University approval required before candidates apply"
                checked={form.universityApprovalRequired}
                onChange={(v) => set("universityApprovalRequired", v)}
              />
              <p className="text-sm text-secondary">
                When enabled, applications route through partner universities for profile verification before reaching your pipeline.
              </p>
            </div>
          )}

          {step === 9 && (
            <div className="space-y-4">
              <FileUploader label="Policy document" value={form.policyDocument} onChange={(v) => set("policyDocument", v)} onRemove={() => set("policyDocument", null)} />
              <FileUploader label="Supporting document" value={form.supportingDocument} onChange={(v) => set("supportingDocument", v)} onRemove={() => set("supportingDocument", null)} />
            </div>
          )}

          {step === 10 && (
            <div className="space-y-4">
              <article className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                <Badge tone="teal">{form.type}</Badge>
                <h3 className="mt-2 text-lg font-semibold">{form.title}</h3>
                <p className="mt-2 text-sm text-secondary">{form.description}</p>
                <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                  <div><dt className="text-secondary">Location</dt><dd>{form.location}, {form.division}</dd></div>
                  <div><dt className="text-secondary">Compensation</dt><dd>{formatCurrency(form.compensationAmount, form.compensationCurrency)} / {form.compensationPeriod}</dd></div>
                  <div><dt className="text-secondary">Deadline</dt><dd>{form.deadline || "—"}</dd></div>
                  <div><dt className="text-secondary">UGC co-funding</dt><dd>{form.enableUgcCoFunding ? `${form.companySharePercent}/${form.ugcSharePercent}` : "No"}</dd></div>
                </dl>
              </article>
              <Switch label="Publish immediately" checked={form.publishNow} onChange={(v) => set("publishNow", v)} />
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            {step > 0 ? <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>Back</Button> : null}
            {step < steps.length - 1 ? (
              <Button onClick={next}>Continue</Button>
            ) : (
              <>
                <Button variant="secondary" loading={submitting} onClick={() => submit(false)}>Save draft</Button>
                <Button loading={submitting} onClick={() => submit(form.publishNow)}>Publish</Button>
              </>
            )}
          </div>
        </MultiStepForm>
      </div>
    </div>
  );
}
